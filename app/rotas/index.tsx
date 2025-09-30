import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import ClienteSelector from '../../components/ClienteSelector';
import MapaRotas from '../../components/MapaRotas';
import { useClientes } from '../../hooks/useClientes';
import { Cliente } from '../../types/cliente';

export default function RotasScreen() {
  const { clientes, loading } = useClientes();
  const [selectedClientes, setSelectedClientes] = useState<Cliente[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{duration: number, distance: number} | null>(null);

  const clientesComCoordenadas = clientes.filter(
    cliente => cliente.endereco_latitude && cliente.endereco_longitude
  );

  const toggleCliente = (cliente: Cliente) => {
    setSelectedClientes(prev => {
      const isSelected = prev.some(c => c.id === cliente.id);
      if (isSelected) {
        return prev.filter(c => c.id !== cliente.id);
      } else {
        return [...prev, cliente];
      }
    });
  };

  const criarRota = () => {
    if (selectedClientes.length === 0) {
      Alert.alert('Aviso', 'Selecione pelo menos um cliente');
      return;
    }
    setShowMap(true);
  };

  const formatarTempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
  };

  const formatarDistancia = (metros: number) => {
    return metros > 1000 
      ? `${(metros / 1000).toFixed(1)} km`
      : `${Math.round(metros)} m`;
  };

  if (showMap) {
    return (
      <View className="flex-1">
        <View className="bg-white p-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Pressable 
              onPress={() => setShowMap(false)}
              className="flex-row items-center"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
              <Text className="ml-2 text-lg font-semibold text-gray-900">
                Rota Otimizada
              </Text>
            </Pressable>
            
            <Text className="text-sm text-gray-600">
              {selectedClientes.length} cliente(s)
            </Text>
          </View>
          
          {routeInfo && (
            <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-xs text-gray-500">TEMPO</Text>
                <Text className="font-semibold text-gray-900">
                  {formatarTempo(routeInfo.duration)}
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-gray-500">DISTÂNCIA</Text>
                <Text className="font-semibold text-gray-900">
                  {formatarDistancia(routeInfo.distance)}
                </Text>
              </View>
            </View>
          )}
        </View>
        
        <MapaRotas 
          clientes={selectedClientes}
          onRouteReady={(duration, distance) => {
            setRouteInfo({ duration, distance });
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Criar Rota</Text>
        <Text className="text-sm text-gray-600 mt-1">
          {clientesComCoordenadas.length} de {clientes.length} cliente(s) disponível(is) para rota
        </Text>
        {loading && <Text className="text-sm text-blue-600 mt-1">Carregando clientes...</Text>}
      </View>

      <View className="flex-1 p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Carregando clientes...</Text>
          </View>
        ) : (
          <ClienteSelector
            clientes={clientesComCoordenadas}
            selectedClientes={selectedClientes}
            onToggleCliente={toggleCliente}
          />
        )}
      </View>

      <View className="bg-white p-4 border-t border-gray-200">
        <Pressable
          onPress={criarRota}
          className={`rounded-lg py-3 px-4 items-center ${
            selectedClientes.length > 0 
              ? 'bg-blue-600' 
              : 'bg-gray-300'
          }`}
          disabled={selectedClientes.length === 0}
        >
          <Text className="text-white font-semibold text-base">
            Criar Rota ({selectedClientes.length})
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
