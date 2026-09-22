export interface Tarefa {
  id?: number;
  tipo_tarefa: string;
  titulo: string;
  nome_cliente: string;
  nome_vendedor: string;
  titulo_negocio: string;
  deal_id: number | null;
  status_operacional: 'Fechada' | 'Em Aberto';
  finalizada: boolean;
  data_evento_str: string;
  raw_datetime: string;
  horas: number;
  contact_id: number | null;
  google_sync: boolean;
  funil?: string;
  CreateDate?: string;
  DateTime?: string;
}

export interface Usuario {
  id: number;
  name: string;
}
