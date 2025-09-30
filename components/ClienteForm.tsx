import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Cliente } from '../types/cliente';

interface ClienteFormProps {
  onSubmit: (cliente: Omit<Cliente, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Cliente;
  loading?: boolean;
}

export default function ClienteForm({ onSubmit, initialData, loading = false }: ClienteFormProps) {
  const [nomeCompleto, setNomeCompleto] = useState(initialData?.nome_completo || '');
  const [telefone, setTelefone] = useState(initialData?.telefone || '');
  const [endereco, setEndereco] = useState(initialData?.endereco || '');
  const [observacao, setObservacao] = useState(initialData?.observacao || '');

  const handleSubmit = async () => {
    if (!nomeCompleto.trim()) {
      Alert.alert('Erro', 'Nome completo é obrigatório');
      return;
    }

    try {
      await onSubmit({
        nome_completo: nomeCompleto.trim(),
        telefone: telefone.trim() || undefined,
        endereco: endereco.trim() || undefined,
        observacao: observacao.trim() || undefined,
      });
      
      // Limpar formulário apenas se não for edição
      if (!initialData) {
        setNomeCompleto('');
        setTelefone('');
        setEndereco('');
        setObservacao('');
      }
    } catch (error) {
      // O erro já é tratado no hook
    }
  };

  return (
    <ScrollView style={{padding: 16}}>
      <View style={{marginBottom: 16}}>
        <Text style={{fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8}}>Nome Completo *</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 16
          }}
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
          placeholder="Digite o nome completo"
          editable={!loading}
        />
      </View>

      <View style={{marginBottom: 16}}>
        <Text style={{fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8}}>Telefone</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 16
          }}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          editable={!loading}
        />
      </View>

      <View style={{marginBottom: 16}}>
        <Text style={{fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8}}>Endereço</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 16
          }}
          value={endereco}
          onChangeText={setEndereco}
          placeholder="Digite o endereço completo"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      <View style={{marginBottom: 24}}>
        <Text style={{fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8}}>Observações</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            fontSize: 16
          }}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Observações adicionais"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      <Pressable
        onPress={handleSubmit}
        style={{
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          alignItems: 'center',
          backgroundColor: loading ? '#9ca3af' : '#2563eb'
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{color: '#fff', fontWeight: '600', fontSize: 16}}>
            {initialData ? 'Atualizar Cliente' : 'Adicionar Cliente'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}