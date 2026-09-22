import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  const ploomesApiKey = process.env.PLOOMES_API_KEY;

  if (!ploomesApiKey) {
    return NextResponse.json({ error: 'API key não configurada' }, { status: 500 });
  }

  const limit = 300;
  let skip = 0;
  let allTasks: any[] = [];
  let hasMore = true;

  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Limitamos a um máximo de iterações por segurança (ex: 50 iter = 15.000 tarefas)
    const maxIterations = 50;
    let iterations = 0;

    while (hasMore && iterations < maxIterations) {
      iterations++;
      console.log(`[Sync] Buscando tarefas (skip: ${skip})...`);
      
      const res = await fetch(`https://api2.ploomes.com/Tasks?$top=${limit}&$skip=${skip}&$expand=Users($expand=User),Contact($expand=Owner),Creator,Type,Deal($expand=Pipeline,Owner)&$orderby=DateTime desc`, {
        headers: {
          'User-Key': ploomesApiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Rate limit atingido (429). Tente novamente mais tarde.');
        }
        throw new Error(`Erro na API do Ploomes: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.value && data.value.length > 0) {
        allTasks = allTasks.concat(data.value);
        if (data.value.length < limit) {
          hasMore = false; // Última página
        } else {
          skip += limit;
          // Respeita o rate limit do Ploomes (120/min = max 2 por segundo). Espera 600ms.
          await new Promise(resolve => setTimeout(resolve, 600)); 
        }
      } else {
        hasMore = false;
      }
    }

    // Funis válidos (excluindo Processo de Vendas e TESTE TI, conforme regra de negócio)
    const validPipelineIds = [
      110018452, // Processo pós-vendas
      110066019, // Atividades Adm.
      110067524, // Comercial 2026
      110066870, // REAJUSTE DE PREÇO 2026
      110067895, // EVENTOS
      110067926, // CONTAGEM OPME
      110068232, // CONTRATOS MN - INSTRUMENTO MAGNUM 15/22 MM
      110068332, // CONTRATOS SCD 700 - COMPRESSORES
    ];

    // Aplica o ETL filtrando os funis indesejados
    const tarefasMapeadas = allTasks
      .filter((task: any) => {
        // Se a tarefa está vinculada a um negócio, verifica se o funil é válido
        if (task.Deal && task.Deal.PipelineId) {
          if (!validPipelineIds.includes(task.Deal.PipelineId)) {
            return false;
          }
        }
        return true; // Mantém tarefas "Sem Funil" (diretas no contato) e as de funis válidos
      })
      .map((task: any) => {
        const isFinalizada = task.Finished; 

        let criadorNome = task.Creator ? task.Creator.Name : 'Desconhecido';
        let vendedorNome = criadorNome;
        
        if (criadorNome === 'Google Calendar') {
          if (task.Users && task.Users.length > 0) {
            vendedorNome = task.Users[0].User?.Name || 'Desconhecido';
          } else if (task.Deal && task.Deal.Owner) {
            vendedorNome = task.Deal.Owner.Name;
          } else if (task.Contact && task.Contact.Owner) {
            vendedorNome = task.Contact.Owner.Name;
          } else {
            vendedorNome = 'Vendedor (Google Agenda)';
          }
        }

        return {
          id: task.Id,
          tipo_tarefa: task.Type ? task.Type.Name : 'Outros', 
          titulo: task.Title || 'Sem Título',
          nome_cliente: task.Contact ? task.Contact.Name : 'Sem Contato',
          nome_vendedor: vendedorNome,
          titulo_negocio: task.Deal ? task.Deal.Title : 'Não Vinculado',
          deal_id: task.DealId,
          funil: task.Deal && task.Deal.Pipeline ? task.Deal.Pipeline.Name : 'Sem Funil',
          status_operacional: isFinalizada ? 'Fechada' : 'Em Aberto',
          finalizada: isFinalizada,
          data_evento_str: task.DateTime ? new Date(task.DateTime).toLocaleDateString('pt-BR') : 'Data não definida',
          raw_datetime: task.DateTime,
          CreateDate: task.CreateDate,
          horas: typeof task.Length === 'number' ? task.Length : 0,
          contact_id: task.ContactId,
          google_sync: !!task.CreatesGoogleCalendarEvent,
        };
      })
    .filter((task: any) => {
      const v = task.nome_vendedor.toLowerCase();
      return !v.includes('informatica') && !v.includes('powerbi');
    });

    // Salva arquivo JSON
    const filePath = path.join(dataDir, 'tarefas.json');
    fs.writeFileSync(filePath, JSON.stringify(tarefasMapeadas, null, 2));

    // --- NOVA FASE: SINCRONIZAÇÃO DE INTERAÇÕES (Fase 1) ---
    console.log('[Sync] Iniciando sincronização de Interações (a partir de Fev/2026)...');
    let allInteractions: any[] = [];
    let intSkip = 0;
    let intHasMore = true;
    let intIterations = 0;

    // Buscando as últimas 1000 interações
    const intMaxIterations = 4; // 4 * 300 = 1200 interações
    while (intHasMore && intIterations < intMaxIterations) {
      intIterations++;
      console.log(`[Sync] Buscando interações (skip: ${intSkip})...`);
      
      const intUrl = encodeURI(`https://api2.ploomes.com/InteractionRecords?$top=${limit}&$skip=${intSkip}&$expand=Creator&$orderby=CreateDate desc`);
      const intRes = await fetch(intUrl, {
        headers: {
          'User-Key': ploomesApiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!intRes.ok) {
        console.error(`Erro na API do Ploomes (Interações): ${intRes.status}`);
        break; // Não falha a sync das tarefas se as interações falharem
      }

      const intData = await intRes.json();
      
      if (intData.value && intData.value.length > 0) {
        allInteractions = allInteractions.concat(intData.value);
        if (intData.value.length < limit) {
          intHasMore = false;
        } else {
          intSkip += limit;
          await new Promise(resolve => setTimeout(resolve, 600)); 
        }
      } else {
        intHasMore = false;
      }
    }

    const interacoesMapeadas = allInteractions.map((int: any) => {
      return {
        id: int.Id,
        data_str: int.CreateDate ? new Date(int.CreateDate).toLocaleDateString('pt-BR') : '',
        raw_datetime: int.CreateDate,
        conteudo: int.Content,
        task_id: int.OriginalTaskId,
        deal_id: int.DealId,
        contact_id: int.ContactId,
        vendedor_id: int.CreatorId,
        nome_vendedor: int.Creator ? int.Creator.Name : 'Desconhecido',
        duracao_segundos: int.DurationInSeconds,
        checkin_endereco: int.CheckInAddress,
        checkin_lat: int.CheckInLatitude,
        checkin_lng: int.CheckInLongitude,
        checkout_endereco: int.CheckOutAddress,
        checkout_lat: int.CheckOutLatitude,
        checkout_lng: int.CheckOutLongitude,
        checkin_validado: !!int.VerifiedCheckIn
      };
    }).filter((int: any) => {
      const v = int.nome_vendedor.toLowerCase();
      return !v.includes('informatica') && !v.includes('powerbi');
    });

    const intFilePath = path.join(dataDir, 'interacoes.json');
    fs.writeFileSync(intFilePath, JSON.stringify(interacoesMapeadas, null, 2));

    return NextResponse.json({ 
      success: true, 
      totalProcessedTasks: tarefasMapeadas.length,
      totalProcessedInteractions: interacoesMapeadas.length,
      message: 'Base de Tarefas e Interações sincronizada com sucesso.' 
    });

  } catch (error: any) {
    console.error('Erro no processo de sync:', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao sincronizar tarefas' }, { status: 500 });
  }
}
