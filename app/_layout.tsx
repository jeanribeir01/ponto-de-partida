import { Stack } from "expo-router";
import "../assets/global.css";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Ponto de Partida" }} />
      <Stack.Screen name="clientes/index" options={{ title: "Clientes" }} />
      <Stack.Screen name="clientes/novo" options={{ title: "Novo Cliente" }} />
    </Stack>
  );
}