import Constants from 'expo-constants';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Coordenadas, MapsService } from '../services/mapsService';
import { Cliente } from '../types/cliente';

interface MapaRotasProps {
  clientes: Cliente[];
  onRouteReady?: (duration: number, distance: number) => void;
}

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey || 
                          Constants.expoConfig?.ios?.config?.googleMapsApiKey || 
                          'AIzaSyBwV1YQtKn0bOI7D1WHBlrYEgGLU9lA25I'; // Fallback hardcoded

export default function MapaRotas({ clientes, onRouteReady }: MapaRotasProps) {
  const [origem, setOrigem] = useState<Coordenadas | null>(null);
  const [rotaOtimizada, setRotaOtimizada] = useState<Cliente[]>([]);

  useEffect(() => {
    inicializarMapa();
  }, [clientes]);

  const inicializarMapa = async () => {
    try {
      const localizacao = await MapsService.getCurrentLocation();
      if (localizacao) {
        setOrigem(localizacao);
        
        if (clientes.length > 0) {
          const coordenadasClientes = clientes
            .filter(c => c.endereco_latitude && c.endereco_longitude)
            .map(c => ({
              latitude: c.endereco_latitude!,
              longitude: c.endereco_longitude!
            }));

          if (coordenadasClientes.length > 0) {
            const rotaOtima = await MapsService.otimizarRota(
              localizacao,
              coordenadasClientes
            );
            
            const clientesOrdenados = rotaOtima.map(coord => 
              clientes.find(c => 
                c.endereco_latitude === coord.latitude && 
                c.endereco_longitude === coord.longitude
              )
            ).filter(Boolean) as Cliente[];
            
            setRotaOtimizada(clientesOrdenados);
          }
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    }
  };

  const calcularRegiao = () => {
    if (!origem || rotaOtimizada.length === 0) {
      return {
        latitude: origem?.latitude || -23.550520,
        longitude: origem?.longitude || -46.633308,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const coordenadas = [
      origem,
      ...rotaOtimizada.map(c => ({
        latitude: c.endereco_latitude!,
        longitude: c.endereco_longitude!
      }))
    ];

    const latitudes = coordenadas.map(c => c.latitude);
    const longitudes = coordenadas.map(c => c.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const padding = 0.01;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + padding,
      longitudeDelta: (maxLng - minLng) + padding,
    };
  };

  const criarWaypoints = () => {
    if (rotaOtimizada.length <= 2) return [];
    
    return rotaOtimizada.slice(0, -1).map(cliente => ({
      latitude: cliente.endereco_latitude!,
      longitude: cliente.endereco_longitude!
    }));
  };

  return (
    <View style={{flex: 1}}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{flex: 1}}
        initialRegion={calcularRegiao()}
        region={calcularRegiao()}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {origem && (
          <Marker
            coordinate={origem}
            title="Sua localização"
            pinColor="blue"
          />
        )}

        {rotaOtimizada.map((cliente, index) => (
          <Marker
            key={cliente.id}
            coordinate={{
              latitude: cliente.endereco_latitude!,
              longitude: cliente.endereco_longitude!
            }}
            title={cliente.nome_completo}
            description={cliente.endereco}
          >
            <View style={{backgroundColor: '#ef4444', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{color: '#ffffff', fontWeight: '700'}}>{index + 1}</Text>
            </View>
          </Marker>
        ))}

        {origem && rotaOtimizada.length > 0 && (
          <MapViewDirections
            origin={origem}
            destination={{
              latitude: rotaOtimizada[rotaOtimizada.length - 1].endereco_latitude!,
              longitude: rotaOtimizada[rotaOtimizada.length - 1].endereco_longitude!
            }}
            waypoints={criarWaypoints()}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#2563eb"
            optimizeWaypoints={true}
            onReady={(result) => {
              onRouteReady?.(result.duration, result.distance);
            }}
            onError={(error) => {
              console.error('Erro na rota:', error);
            }}
          />
        )}
      </MapView>
    </View>
  );
}
