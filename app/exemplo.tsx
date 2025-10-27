import { Text, View } from 'react-native';

// O nome da função deve ser o nome da tela em PascalCase
export default function ExemploScreen() {
  return (
    // A View é como uma "caixa" que agrupa outros elementos
    <View>
      {/* Text é usado para exibir qualquer texto */}
      <Text>Olá, esta é a tela de Exemplo!</Text>
    </View>
  );
}
