import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Cliente } from '../types/cliente';

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedClientes: Cliente[];
  onToggleCliente: (cliente: Cliente) => void;
}

export default function ClienteSelector({ 
  clientes, 
  selectedClientes, 
  onToggleCliente 
}: ClienteSelectorProps) {
  const isSelected = (cliente: Cliente) => 
    selectedClientes.some(c => c.id === cliente.id);

  const renderCliente = ({ item }: { item: Cliente }) => {
    const selected = isSelected(item);
    const hasCoordinates = !!item.endereco_latitude && !!item.endereco_longitude;

    return (
      <Pressable
        onPress={() => onToggleCliente(item)}
        style={{
          padding: 16,
          marginBottom: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: selected ? '#93c5fd' : '#e5e7eb',
          backgroundColor: selected ? '#eff6ff' : '#ffffff',
          opacity: hasCoordinates ? 1 : 0.5,
        }}
        disabled={!hasCoordinates}
      >
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={{flex: 1}}>
            <Text style={{fontWeight: '600', color: selected ? '#1e3a8a' : '#111827'}}>
              {item.nome_completo}
            </Text>
            {item.endereco && (
              <Text style={{color: '#6b7280', marginTop: 4}} numberOfLines={2}>
                {item.endereco}
              </Text>
            )}
            {!hasCoordinates && (
              <Text style={{color: '#ef4444', marginTop: 4, fontSize: 12}}>
                Endereço não geocodificado
              </Text>
            )}
          </View>
          
          <View style={{marginLeft: 12}}>
            {selected ? (
              <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
            ) : (
              <View style={{width: 24, height: 24, borderWidth: 2, borderColor: '#d1d5db', borderRadius: 12}} />
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{flex: 1}}>
      <Text style={{fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12}}>
        Selecione os clientes para visitar
      </Text>
      <Text style={{color: '#6b7280', marginBottom: 12}}>
        {selectedClientes.length} cliente(s) selecionado(s)
      </Text>
      
      {clientes.length === 0 ? (
        <View style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 48}}>
          <Text style={{color: '#6b7280', textAlign: 'center'}}>
            Nenhum cliente disponível para rota.{'\n'}
            Adicione clientes com endereços na aba "Clientes".
          </Text>
        </View>
      ) : (
        <FlatList
          data={clientes}
          renderItem={renderCliente}
          keyExtractor={(item) => item.id!}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
