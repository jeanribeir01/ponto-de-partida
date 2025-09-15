import { Text, View } from "react-native";
import ClientForm from "../../components/ClientForm";

export default function AddClientScreen() {
  return (
    <View className="flex-1 bg-white">
      <Text className="text-xl font-bold p-4">Adicionar Cliente</Text>
      <ClientForm />
    </View>
  );
}