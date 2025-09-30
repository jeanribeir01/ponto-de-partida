import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import ClienteForm from '../../components/ClienteForm';
import { useClientes } from '../../hooks/useClientes';

export default function NovoClienteScreen() {
  const { createCliente } = useClientes();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (clienteData: any) => {
    setLoading(true);
    try {
      await createCliente(clienteData);
      Alert.alert('Sucesso', 'Cliente adicionado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <ClienteForm onSubmit={handleSubmit} loading={loading} />
    </View>
  );
}