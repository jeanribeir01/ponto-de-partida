export interface Cliente {
  id?: string;
  nome_completo: string;
  telefone?: string;
  endereco?: string;
  observacao?: string;
  endereco_latitude?: number;
  endereco_longitude?: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}