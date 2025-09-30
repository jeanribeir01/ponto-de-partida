import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { Cliente } from '../types/cliente';

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
  async getAll(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  
  async create(cliente: Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    const { data: newCliente, error } = await supabase
      .from('clientes')
      .insert([{
        ...cliente,
        user_id: userId,
      }])
      .select()
      .single();
    
    if (error) throw error;
    return newCliente;
  },
  
  async update(id: string, updates: Partial<Cliente>): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};