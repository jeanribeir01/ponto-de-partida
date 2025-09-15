import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../utils/supabase";

export default function ClientForm({ onClientAdded }: { onClientAdded?: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddClient() {
    if (!name || !address) {
      Alert.alert("Nome e endereço são obrigatórios.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("clients").insert([{ name, email, address }]);
    setLoading(false);
    if (error) {
      Alert.alert("Erro ao adicionar cliente", error.message);
    } else {
      setName("");
      setEmail("");
      setAddress("");
      Alert.alert("Cliente adicionado com sucesso!");
      onClientAdded?.();
    }
  }

  return (
    <View className="p-4">
      <Text className="mb-1">Nome *</Text>
      <TextInput
        className="border rounded px-3 py-2 mb-3"
        value={name}
        onChangeText={setName}
        placeholder="Nome do cliente"
      />
      <Text className="mb-1">Email</Text>
      <TextInput
        className="border rounded px-3 py-2 mb-3"
        value={email}
        onChangeText={setEmail}
        placeholder="Email (opcional)"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text className="mb-1">Endereço *</Text>
      <TextInput
        className="border rounded px-3 py-2 mb-3"
        value={address}
        onChangeText={setAddress}
        placeholder="Endereço completo"
      />
      <Pressable
        className="bg-blue-600 rounded py-3 items-center"
        onPress={handleAddClient}
        disabled={loading}
      >
        <Text className="text-white font-medium">{loading ? "Salvando..." : "Adicionar Cliente"}</Text>
      </Pressable>
    </View>
  );
}