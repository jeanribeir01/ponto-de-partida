import Constants from 'expo-constants';
import * as Location from 'expo-location';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.android?.config?.googleMaps?.apiKey || '';

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export class MapsService {
  static async geocodeEndereco(endereco: string): Promise<Coordenadas | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json() as {
        status: string;
        results: Array<{
          geometry: {
            location: {
              lat: number;
              lng: number;
            };
          };
        }>;
      };
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error);
      return null;
    }
  }

  static async getCurrentLocation(): Promise<Coordenadas | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão de localização negada');
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Erro ao obter localização atual:', error);
      return null;
    }
  }

  static async otimizarRota(origem: Coordenadas, destinos: Coordenadas[]): Promise<Coordenadas[]> {
    try {
      if (!destinos || destinos.length === 0) return [];
      const waypoints = destinos.map(d => `${d.latitude},${d.longitude}`).join('|');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origem.latitude},${origem.longitude}&destination=${origem.latitude},${origem.longitude}&waypoints=optimize:true|${waypoints}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json() as {
        status: string;
        routes: Array<{
          waypoint_order?: number[];
        }>;
      };
      
      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const waypointOrder: number[] = route.waypoint_order || [];
        return waypointOrder.map(index => destinos[index]);
      }
      return destinos;
    } catch (error) {
      console.error('Erro ao otimizar rota:', error);
      return destinos;
    }
  }
}
