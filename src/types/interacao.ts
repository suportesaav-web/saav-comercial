export interface Interacao {
  id: number;
  data_str: string;
  raw_datetime: string;
  conteudo: string | null;
  task_id: number | null;
  deal_id: number | null;
  contact_id: number | null;
  vendedor_id: number | null;
  nome_vendedor: string;
  duracao_segundos: number | null;
  checkin_endereco: string | null;
  checkin_lat: number | null;
  checkin_lng: number | null;
  checkout_endereco: string | null;
  checkout_lat: number | null;
  checkout_lng: number | null;
  checkin_validado: boolean;
}
