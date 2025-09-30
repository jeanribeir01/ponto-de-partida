export interface Cliente {
  id?: string;
  nome_completo: string;
  telefone?: string;
  endereco?: string;
  observacao?: string;
  // latitude/longitude can be null if not geocoded yet
  endereco_latitude?: number | null;
  endereco_longitude?: number | null;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClienteComCoordenadas extends Cliente {
  endereco_latitude: number;
  endereco_longitude: number;
}