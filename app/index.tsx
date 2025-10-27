import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function App() {

  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Text className="text-2xl font-bold">Página Inicial</Text>
      <Link href="/exemplo" className="text-blue-600 underline">
        Ir para Exemplo
      </Link>
    </View>
  )
}