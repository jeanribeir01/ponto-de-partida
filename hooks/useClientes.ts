import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Cliente } from '../types/cliente';
import { clientesAPI } from '../utils/supabase';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesAPI.getAll();
      setClientes(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os clientes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (cliente: Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCliente = await clientesAPI.create(cliente);
      setClientes(prev => [newCliente, ...prev]);
      return newCliente;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o cliente');
      throw error;
    }
  };

  const updateCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      const updatedCliente = await clientesAPI.update(id, updates);
      setClientes(prev => 
        prev.map(cliente => 
          cliente.id === id ? updatedCliente : cliente
        )
      );
      return updatedCliente;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o cliente');
      throw error;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      await clientesAPI.delete(id);
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o cliente');
      throw error;
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  return {
    clientes,
    loading,
    createCliente,
    updateCliente,
    deleteCliente,
    refreshClientes: loadClientes,
  };
}