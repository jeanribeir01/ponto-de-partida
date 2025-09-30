import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useClientes } from '../../hooks/useClientes';
import { Cliente } from '../../types/cliente';

export default function ClientesScreen() {
  const { clientes, loading, refreshClientes } = useClientes();

  const renderCliente = ({ item }: { item: Cliente }) => (
    <Pressable
      onPress={() => router.push(`./${item.id}`)}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
    >
      <Text className="text-lg font-semibold text-gray-900 mb-1">
        {item.nome_completo}
      </Text>
      {item.telefone && (
        <Text className="text-gray-600 mb-1">{item.telefone}</Text>
      )}
      {item.endereco && (
        <Text className="text-gray-500 text-sm mb-1" numberOfLines={2}>
          {item.endereco}
        </Text>
      )}
      {item.observacao && (
        <Text className="text-gray-400 text-sm" numberOfLines={1}>
          {item.observacao}
        </Text>
      )}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Clientes</Text>
        <Pressable
          onPress={() => router.push('/clientes/novo')}
          className="bg-blue-600 rounded-lg px-4 py-2"
        >
          <Text className="text-white font-medium">Novo Cliente</Text>
        </Pressable>
      </View>

      <FlatList
        data={clientes}
        renderItem={renderCliente}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshClientes} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-center">
              Nenhum cliente encontrado.{'\n'}
              Toque em "Novo Cliente" para adicionar o primeiro.
            </Text>
          </View>
        }
      />
    </View>
  );
}