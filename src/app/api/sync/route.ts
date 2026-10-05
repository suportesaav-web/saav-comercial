import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  const ploomesApiKey = process.env.PLOOMES_API_KEY;

  if (!ploomesApiKey) {
    return NextResponse.json({ error: 'API key não configurada' }, { status: 500 });
  }

  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Helpers for independent fetching
  async function fetchOData(endpoint: string, limit: number, maxIterations: number) {
    let skip = 0;
    let allData: any[] = [];
    let hasMore = true;
    let iterations = 0;

    while (hasMore && iterations < maxIterations) {
      iterations++;
      console.log(`[Sync] Buscando ${endpoint.split('?')[0]} (skip: ${skip})...`);
      
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `https://api2.ploomes.com/${endpoint}${separator}$top=${limit}&$skip=${skip}`;
      
      const res = await fetch(url, {
        headers: {
          'User-Key': ploomesApiKey as string,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error(`Rate limit atingido (429) em ${endpoint}. Tente novamente mais tarde.`);
        }
        throw new Error(`Erro na API do Ploomes em ${endpoint}: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.value && data.value.length > 0) {
        allData = allData.concat(data.value);
        if (data.value.length < limit) {
          hasMore = false;
        } else {
          skip += limit;
          await new Promise(resolve => setTimeout(resolve, 600)); 
        }
      } else {
        hasMore = false;
      }
    }
    return allData;
  }

  const results = {
    success: true,
    tasks: { success: false, total: 0 },
    interactions: { success: false, total: 0 },
    deals: { success: false, total: 0 },
    contacts: { success: false, total: 0 }
  };

  // --- TAREFAS ---
  try {
    const allTasks = await fetchOData('Tasks?$expand=Users($expand=User),Contact($expand=Owner),Creator,Type,Deal($expand=Pipeline,Owner)&$orderby=DateTime desc', 300, 50);
    
    const validPipelineIds = [
      110018452, 110066019, 110067524, 110066870, 110067895, 110067926, 110068232, 110068332
    ];

    const tarefasMapeadas = allTasks
      .filter((task: any) => {
        if (task.Deal && task.Deal.PipelineId) {
          if (!validPipelineIds.includes(task.Deal.PipelineId)) return false;
        }
        return true;
      })
      .map((task: any) => {
        const isFinalizada = task.Finished; 
        let criadorNome = task.Creator ? task.Creator.Name : 'Desconhecido';
        let vendedorNome = criadorNome;
        if (criadorNome === 'Google Calendar') {
          if (task.Users && task.Users.length > 0) vendedorNome = task.Users[0].User?.Name || 'Desconhecido';
          else if (task.Deal && task.Deal.Owner) vendedorNome = task.Deal.Owner.Name;
          else if (task.Contact && task.Contact.Owner) vendedorNome = task.Contact.Owner.Name;
          else vendedorNome = 'Vendedor (Google Agenda)';
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

    fs.writeFileSync(path.join(dataDir, 'tarefas.json'), JSON.stringify(tarefasMapeadas, null, 2));
    results.tasks.success = true;
    results.tasks.total = tarefasMapeadas.length;
  } catch (err: any) {
    console.error('Falha em Tasks:', err.message);
  }

  // --- INTERAÇÕES ---
  try {
    const allInteractions = await fetchOData('InteractionRecords?$expand=Creator&$orderby=CreateDate desc', 300, 4);
    const interacoesMapeadas = allInteractions.map((int: any) => ({
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
    })).filter((int: any) => {
      const v = int.nome_vendedor.toLowerCase();
      return !v.includes('informatica') && !v.includes('powerbi');
    });

    fs.writeFileSync(path.join(dataDir, 'interacoes.json'), JSON.stringify(interacoesMapeadas, null, 2));
    results.interactions.success = true;
    results.interactions.total = interacoesMapeadas.length;
  } catch (err: any) {
    console.error('Falha em Interactions:', err.message);
  }

  // --- DEALS ---
  try {
    const allDeals = await fetchOData('Deals?$expand=Pipeline,Stage,Owner,Contact,Person&$orderby=Id desc', 100, 50);
    const dealsMapeados = allDeals.map((deal: Record<string, unknown>) => ({
      id: deal.Id as number,
      title: (deal.Title as string) || 'Sem título',
      amount: typeof deal.Amount === 'number' ? deal.Amount : null,
      pipelineId: deal.PipelineId as number | null,
      pipelineName: deal.Pipeline ? (deal.Pipeline as Record<string, unknown>).Name as string : null,
      stageId: deal.StageId as number | null,
      stageName: deal.Stage ? (deal.Stage as Record<string, unknown>).Name as string : null,
      statusId: deal.StatusId as number | null,
      ownerId: deal.OwnerId as number | null,
      ownerName: deal.Owner ? (deal.Owner as Record<string, unknown>).Name as string : null,
      contactId: deal.ContactId as number | null,
      contactName: deal.Contact ? (deal.Contact as Record<string, unknown>).Name as string : null,
      personId: deal.PersonId as number | null,
      personName: deal.Person ? (deal.Person as Record<string, unknown>).Name as string : null,
      createDate: (deal.CreateDate as string) || null,
      startDate: (deal.StartDate as string) || null,
      finishDate: (deal.FinishDate as string) || null,
      lastUpdateDate: (deal.LastUpdateDate as string) || null,
      daysInStage: typeof deal.DaysInStage === 'number' ? deal.DaysInStage : null
    }));

    fs.writeFileSync(path.join(dataDir, 'deals.json'), JSON.stringify(dealsMapeados, null, 2));
    results.deals.success = true;
    results.deals.total = dealsMapeados.length;
  } catch (err: unknown) {
    if (err instanceof Error) console.error('Falha em Deals:', err.message);
  }

  // --- CONTACTS ---
  try {
    // Apenas clientes do tipo EMPRESA (TypeId = 1)
    const allContacts = await fetchOData('Contacts?$filter=TypeId eq 1&$orderby=Id desc', 200, 50);
    const contactsMapeados = allContacts.map((contact: Record<string, unknown>) => ({
      id: contact.Id as number,
      name: (contact.Name as string) || 'Desconhecido',
      email: (contact.Email as string) || null,
      cnpj: (contact.CNPJ as string) || (contact.CPF as string) || null
    }));

    fs.writeFileSync(path.join(dataDir, 'contacts.json'), JSON.stringify(contactsMapeados, null, 2));
    results.contacts.success = true;
    results.contacts.total = contactsMapeados.length;
  } catch (err: unknown) {
    if (err instanceof Error) console.error('Falha em Contacts:', err.message);
  }

  return NextResponse.json(results);
}
