import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://cviqywvhhzyzedynrpkx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aXF5d3ZoaHp5emVkeW5ycGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjIwNjcsImV4cCI6MjA3MzA5ODA2N30.OubxygstW2mlGqOV6ZBGA55siIbbeSEmiYMuvlM8sl4';


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const clientesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async create(cliente: any) {
    // Obtenha o usuário autenticado
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const cleanCliente = {
      ...cliente,
      email: cliente.email ?? null,
      telefone: cliente.telefone ?? null,
      endereco_latitude: cliente.endereco_latitude ?? null,
      endereco_longitude: cliente.endereco_longitude ?? null,
      user_id: userId,
    };
    const { data, error } = await supabase
      .from('clientes')
      .insert([cleanCliente])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
