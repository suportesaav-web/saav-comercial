import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'tarefas.json');
    
    // 1. Tenta carregar o Cache Local (criado pelo ETL da aba Sincronizar)
    if (existsSync(filePath)) {
      const fileBuffer = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileBuffer);
      return NextResponse.json(data);
    }

    // 2. Fallback: Se o cache não existir, busca direto da API para não quebrar a tela
    const ploomesApiKey = process.env.PLOOMES_API_KEY;
    if (!ploomesApiKey) {
      return NextResponse.json([]); // Retorna vazio se não tiver nem cache nem chave
    }

    const res = await fetch('https://api2.ploomes.com/Tasks?$top=200&$expand=Users($expand=User),Contact($expand=Owner),Creator,Type,Deal($expand=Pipeline,Owner)&$orderby=DateTime desc', {
      headers: {
        'User-Key': ploomesApiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } 
    });

    if (!res.ok) throw new Error('Falha ao buscar fallback da API');

    const data = await res.json();
    const tarefasMapeadas = data.value.flatMap((task: any) => {
      const isFinalizada = task.Finished; 

      let vendedores: string[] = [];
      let criadorNome = task.Creator ? task.Creator.Name : 'Desconhecido';
      
      if (task.Users && task.Users.length > 0) {
        vendedores = task.Users.map((u: any) => u.User?.Name || 'Desconhecido');
      } else if (criadorNome === 'Google Calendar') {
        if (task.Deal && task.Deal.Owner) {
          vendedores = [task.Deal.Owner.Name];
        } else if (task.Contact && task.Contact.Owner) {
          vendedores = [task.Contact.Owner.Name];
        } else {
          vendedores = ['Vendedor (Google Agenda)'];
        }
      } else {
        vendedores = [criadorNome];
      }

      return vendedores.map((vendedorNome, index) => {
        return {
          id: vendedores.length > 1 ? `${task.Id}-${index}` : task.Id,
          tipo_tarefa: task.Type ? task.Type.Name : 'Outros', 
          titulo: task.Title || 'Sem Título',
          nome_cliente: task.Contact ? task.Contact.Name : 'Sem Contato',
          nome_vendedor: vendedorNome,
          titulo_negocio: task.Deal ? task.Deal.Title : 'Não Vinculado',
          deal_id: task.DealId,
          status_operacional: isFinalizada ? 'Fechada' : 'Em Aberto',
          finalizada: isFinalizada,
          data_evento_str: task.DateTime ? new Date(task.DateTime).toLocaleDateString('pt-BR') : 'Data não definida',
          raw_datetime: task.DateTime,
          horas: typeof task.Length === 'number' ? task.Length : 0,
          contact_id: task.ContactId,
          google_sync: !!task.CreatesGoogleCalendarEvent,
        };
      });
    }).filter((task: any) => {
      const v = task.nome_vendedor.toLowerCase();
      return !v.includes('informatica') && !v.includes('powerbi');
    });

    return NextResponse.json(tarefasMapeadas);

  } catch (error) {
    console.error('Erro ao ler base de tarefas local:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar a base.' }, { status: 500 });
  }
}
