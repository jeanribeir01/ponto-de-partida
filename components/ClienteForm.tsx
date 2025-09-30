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
    <ScrollView className="p-4">
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Nome Completo *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-base"
          value={nomeCompleto}
          onChangeText={setNomeCompleto}
          placeholder="Digite o nome completo"
          editable={!loading}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Telefone</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-base"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          editable={!loading}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Endereço</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-base"
          value={endereco}
          onChangeText={setEndereco}
          placeholder="Digite o endereço completo"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Observações</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2 text-base"
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
        className={`rounded-lg py-3 px-4 items-center ${
          loading ? 'bg-gray-400' : 'bg-blue-600'
        }`}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">
            {initialData ? 'Atualizar Cliente' : 'Adicionar Cliente'}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}