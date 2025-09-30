import { Ionicons } from '@expo/vector-icons';
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
      style={{backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, borderWidth: 1, borderColor: '#e5e7eb'}}
    >
      <Text style={{fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4}}>
        {item.nome_completo}
      </Text>
      {item.telefone && (
        <Text style={{color: '#4b5563', marginBottom: 4}}>{item.telefone}</Text>
      )}
      {item.endereco && (
        <Text style={{color: '#6b7280', fontSize: 14, marginBottom: 4}} numberOfLines={2}>
          {item.endereco}
        </Text>
      )}
      {item.observacao && (
        <Text style={{color: '#9ca3af', fontSize: 14}} numberOfLines={1}>
          {item.observacao}
        </Text>
      )}
    </Pressable>
  );

  return (
    <View style={{flex: 1, backgroundColor: '#f9fafb'}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb'}}>
        <Text style={{fontSize: 20, fontWeight: '700', color: '#111827'}}>Clientes</Text>
        <Pressable
          onPress={() => router.push('/clientes/novo')}
          style={{backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center'}}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={{color: '#fff', fontWeight: '500', marginLeft: 4}}>Novo</Text>
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
          <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 48}}>
            <Text style={{color: '#6b7280', textAlign: 'center'}}>
              Nenhum cliente encontrado.{'\n'}
              Toque em "Novo" para adicionar o primeiro.
            </Text>
          </View>
        }
      />
    </View>
  );
}