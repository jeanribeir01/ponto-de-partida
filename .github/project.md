# Guia Completo de Implementação - Ponto de Partida

Vou revisar e melhorar a estrutura completa do projeto, seguindo as instruções do Copilot e as melhores práticas.

## Fase 1: Configuração do Banco de Dados (Supabase)

Execute os seguintes scripts no SQL Editor do Supabase:

### 1.1 Criar Tabela `profiles` (se ainda não existe)

```sql
-- Tabela de Perfis de Usuário
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table profiles enable row level security;

-- Políticas
create policy "Profiles are viewable by owner"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Trigger para criar profile automaticamente após signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 1.2 Criar Tabelas do Projeto

```sql
-- Tabela de Clientes
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  address text not null,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table clients enable row level security;

create policy "Users can view own clients"
  on clients for select using (auth.uid() = user_id);

create policy "Users can insert own clients"
  on clients for insert with check (auth.uid() = user_id);

create policy "Users can update own clients"
  on clients for update using (auth.uid() = user_id);

create policy "Users can delete own clients"
  on clients for delete using (auth.uid() = user_id);

create index clients_user_id_idx on clients(user_id);
create index clients_name_idx on clients(name);

-- Tabela de Produtos
create table products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  stock_quantity integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table products enable row level security;

create policy "Users can view own products"
  on products for select using (auth.uid() = user_id);

create policy "Users can insert own products"
  on products for insert with check (auth.uid() = user_id);

create policy "Users can update own products"
  on products for update using (auth.uid() = user_id);

create policy "Users can delete own products"
  on products for delete using (auth.uid() = user_id);

create index products_user_id_idx on products(user_id);

-- Tabela de Rotas
create table routes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  date date not null,
  status text default 'planned' check (status in ('planned', 'in_progress', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table routes enable row level security;

create policy "Users can view own routes"
  on routes for select using (auth.uid() = user_id);

create policy "Users can insert own routes"
  on routes for insert with check (auth.uid() = user_id);

create policy "Users can update own routes"
  on routes for update using (auth.uid() = user_id);

create policy "Users can delete own routes"
  on routes for delete using (auth.uid() = user_id);

create index routes_user_id_idx on routes(user_id);
create index routes_date_idx on routes(date desc);

-- Tabela de Paradas de Rota
create table route_stops (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references routes(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  stop_order integer not null,
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table route_stops enable row level security;

create policy "Users can view own route stops"
  on route_stops for select
  using (exists (
    select 1 from routes
    where routes.id = route_stops.route_id
    and routes.user_id = auth.uid()
  ));

create policy "Users can insert own route stops"
  on route_stops for insert
  with check (exists (
    select 1 from routes
    where routes.id = route_stops.route_id
    and routes.user_id = auth.uid()
  ));

create policy "Users can update own route stops"
  on route_stops for update
  using (exists (
    select 1 from routes
    where routes.id = route_stops.route_id
    and routes.user_id = auth.uid()
  ));

create policy "Users can delete own route stops"
  on route_stops for delete
  using (exists (
    select 1 from routes
    where routes.id = route_stops.route_id
    and routes.user_id = auth.uid()
  ));

create index route_stops_route_id_idx on route_stops(route_id);
create index route_stops_order_idx on route_stops(stop_order);
```

## Fase 2: Instalar Dependências

```bash
# Mapa e localização
npx expo install react-native-maps expo-location

# Date picker
npx expo install @react-native-community/datetimepicker

# Ícones (se ainda não instalado)
npx expo install @expo/vector-icons

# Safe area context
npx expo install react-native-safe-area-context
```

## Fase 3: Criar Types

````typescript
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  user_id: string;
  name: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface RouteStop {
  id: string;
  route_id: string;
  client_id: string;
  stop_order: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface RouteStopWithClient extends RouteStop {
  client: Client;
}
````

## Fase 4: Criar Utilitários

````typescript
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar:', error);
    return null;
  }
}

export async function optimizeRoute(
  origin: Coordinates,
  waypoints: Coordinates[]
): Promise<number[] | null> {
  try {
    if (waypoints.length === 0) return [];
    
    const waypointsStr = waypoints
      .map(wp => `${wp.latitude},${wp.longitude}`)
      .join('|');
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${origin.latitude},${origin.longitude}&waypoints=optimize:true|${waypointsStr}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.routes.length > 0) {
      return data.routes[0].waypoint_order || [];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao otimizar rota:', error);
    return null;
  }
}
````

````typescript
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
````

## Fase 5: Componentes Reutilizáveis

````typescript
import { ActivityIndicator, View, Text } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Carregando...' }: LoadingOverlayProps) {
  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-white rounded-xl p-6 items-center min-w-[200px]">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-700 text-center">{message}</Text>
      </View>
    </View>
  );
}
````

````typescript
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
}

export default function FloatingActionButton({ 
  onPress, 
  icon = 'add',
  label 
}: FloatingActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 bg-blue-600 rounded-full shadow-lg active:bg-blue-700"
      style={{ elevation: 8 }}
    >
      {label ? (
        <View className="flex-row items-center px-5 py-3.5 gap-2">
          <Ionicons name={icon} size={22} color="white" />
          <Text className="text-white font-semibold text-base">{label}</Text>
        </View>
      ) : (
        <View className="w-14 h-14 items-center justify-center">
          <Ionicons name={icon} size={26} color="white" />
        </View>
      )}
    </Pressable>
  );
}
````

````typescript
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="bg-gray-100 rounded-full p-6 mb-4">
        <Ionicons name={icon} size={64} color="#9ca3af" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-gray-600 text-center leading-5">
        {message}
      </Text>
    </View>
  );
}
````

## Fase 6: Telas de Autenticação

````typescript
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(app)/routes" />;
  }

  return <Redirect href="/login" />;
}
````

````typescript
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro ao fazer login', error.message);
    } else {
      router.replace('/(app)/routes');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerClassName="flex-1">
        <View className="flex-1 p-6 justify-center">
          {/* Logo/Título */}
          <View className="items-center mb-12">
            <View className="bg-blue-600 rounded-full p-6 mb-4">
              <Ionicons name="map" size={48} color="white" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">
              Ponto de Partida
            </Text>
            <Text className="text-gray-600 mt-2 text-center">
              Gerencie suas entregas com eficiência
            </Text>
          </View>

          {/* Formulário */}
          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Senha
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-900"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#6b7280"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`rounded-lg py-4 items-center mt-2 ${
                loading ? 'bg-gray-300' : 'bg-blue-600 active:bg-blue-700'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Entrar
                </Text>
              )}
            </Pressable>
          </View>

          {/* Link para cadastro */}
          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="text-gray-600">Não tem uma conta?</Text>
            <Link href="/signup" asChild>
              <Pressable>
                <Text className="text-blue-600 font-semibold">Cadastre-se</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
````

````typescript
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erro ao criar conta', error.message);
    } else {
      Alert.alert(
        'Sucesso!',
        'Conta criada com sucesso. Você já pode fazer login.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerClassName="flex-1">
        <View className="flex-1 p-6 justify-center">
          {/* Título */}
          <View className="items-center mb-8">
            <View className="bg-blue-600 rounded-full p-5 mb-3">
              <Ionicons name="person-add" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              Criar Conta
            </Text>
            <Text className="text-gray-600 mt-1 text-center">
              Comece a otimizar suas entregas
            </Text>
          </View>

          {/* Formulário */}
          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Maria Silva"
                autoCapitalize="words"
                autoComplete="name"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Senha
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-900"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#6b7280"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleSignUp}
              disabled={loading}
              className={`rounded-lg py-4 items-center mt-2 ${
                loading ? 'bg-gray-300' : 'bg-blue-600 active:bg-blue-700'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Criar Conta
                </Text>
              )}
            </Pressable>
          </View>

          {/* Link para login */}
          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="text-gray-600">Já tem uma conta?</Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text className="text-blue-600 font-semibold">Faça login</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
````

## Fase 7: Layout Principal com Tabs

````typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#2563eb',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Rotas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Conta',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
````

## Fase 8: Telas de Clientes

````typescript
import { Stack } from 'expo-router';

export default function ClientsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Clientes' }} />
      <Stack.Screen
        name="new"
        options={{
          title: 'Novo Cliente',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Editar Cliente' }}
      />
    </Stack>
  );
}
````

````typescript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { Client } from '@/types/database';
import FloatingActionButton from '@/components/FloatingActionButton';
import EmptyState from '@/components/EmptyState';
import { formatPhone } from '@/utils/format';

export default function ClientsListScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, clients]);

  async function loadClients() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      Alert.alert('Erro ao carregar clientes', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function filterClients() {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(query) ||
      client.address.toLowerCase().includes(query) ||
      (client.phone && client.phone.includes(query))
    );
    setFilteredClients(filtered);
  }

  function onRefresh() {
    setRefreshing(true);
    loadClients();
  }

  function renderClientItem({ item }: { item: Client }) {
    return (
      <Pressable
        onPress={() => router.push(`/clients/${item.id}`)}
        className="bg-white rounded-lg p-4 mb-3 shadow-sm active:bg-gray-50"
        style={{ elevation: 2 }}
      >
        <View className="flex-row items-start">
          <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center mr-3">
            <Ionicons name="person" size={24} color="#2563eb" />
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {item.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600 ml-1 flex-1" numberOfLines={1}>
                {item.address}
              </Text>
            </View>
            {item.phone && (
              <View className="flex-row items-center mt-1">
                <Ionicons name="call-outline" size={16} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1">
                  {formatPhone(item.phone)}
                </Text>
              </View>
            )}
          </View>

          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Barra de Pesquisa */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar cliente..."
            className="flex-1 ml-2 text-gray-900"
            placeholderTextColor="#9ca3af"
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={renderClientItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Nenhum cliente encontrado"
            message={
              searchQuery
                ? 'Tente buscar com outros termos'
                : 'Adicione seu primeiro cliente para começar'
            }
          />
        }
      />

      <FloatingActionButton
        onPress={() => router.push('/clients/new')}
        icon="add"
      />
    </View>
  );
}
````

# Guia Completo de Implementação - Ponto de Partida

## Fase 8: Telas de Clientes (Continuação)

### 8.2 Tela de Novo Cliente

````typescript
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { geocodeAddress } from '@/utils/geocoding';

export default function NewClientScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  function formatPhoneInput(text: string) {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Formata (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (limited.length <= 2) return limited;
    if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    if (limited.length <= 11) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
    return limited;
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Digite o nome do cliente');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Atenção', 'Digite o endereço do cliente');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Tentar geocodificar o endereço
      const coords = await geocodeAddress(address.trim());

      const { error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: name.trim(),
          phone: phone.replace(/\D/g, '') || null,
          address: address.trim(),
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null,
        });

      if (error) throw error;

      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro ao cadastrar cliente', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView>
        <View className="p-4">
          {/* Nome */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nome <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Maria Silva"
              autoCapitalize="words"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Telefone */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Telefone
            </Text>
            <TextInput
              value={phone}
              onChangeText={(text) => setPhone(formatPhoneInput(text))}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
              maxLength={15}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Endereço */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Endereço Completo <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Rua, número, bairro, cidade - UF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
            <Text className="text-xs text-gray-500 mt-1">
              Digite o endereço completo para melhor precisão nas rotas
            </Text>
          </View>

          {/* Info sobre geocodificação */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex-row">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text className="text-xs text-blue-800 ml-2 flex-1">
              O endereço será automaticamente localizado no mapa para otimizar suas rotas
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botão Fixo */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Pressable
          onPress={handleSave}
          disabled={loading}
          className={`rounded-lg py-4 items-center ${
            loading ? 'bg-gray-300' : 'bg-blue-600 active:bg-blue-700'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Salvar Cliente
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
````

### 8.3 Tela de Editar Cliente

````typescript
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { Client } from '@/types/database';
import { geocodeAddress } from '@/utils/geocoding';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function EditClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadClient();
  }, [id]);

  async function loadClient() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setClient(data);
      setName(data.name);
      setPhone(formatPhone(data.phone || ''));
      setAddress(data.address);
    } catch (error: any) {
      Alert.alert('Erro ao carregar cliente', error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function formatPhone(phoneNumber: string) {
    const numbers = phoneNumber.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return phoneNumber;
  }

  function formatPhoneInput(text: string) {
    const numbers = text.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);
    
    if (limited.length <= 2) return limited;
    if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Digite o nome do cliente');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Atenção', 'Digite o endereço do cliente');
      return;
    }

    setSaving(true);

    try {
      // Verificar se o endereço mudou
      const addressChanged = address.trim() !== client?.address;
      let coords = null;

      if (addressChanged) {
        coords = await geocodeAddress(address.trim());
      }

      const updateData: any = {
        name: name.trim(),
        phone: phone.replace(/\D/g, '') || null,
        address: address.trim(),
        updated_at: new Date().toISOString(),
      };

      if (addressChanged && coords) {
        updateData.latitude = coords.latitude;
        updateData.longitude = coords.longitude;
      }

      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Cliente atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro ao atualizar cliente', error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Excluir Cliente',
      `Tem certeza que deseja excluir ${client?.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  }

  async function confirmDelete() {
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Cliente excluído com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro ao excluir cliente', error.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return <LoadingOverlay message="Carregando cliente..." />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView>
        <View className="p-4">
          {/* Nome */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nome <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Maria Silva"
              autoCapitalize="words"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Telefone */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Telefone
            </Text>
            <TextInput
              value={phone}
              onChangeText={(text) => setPhone(formatPhoneInput(text))}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
              maxLength={15}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Endereço */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Endereço Completo <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Rua, número, bairro, cidade - UF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Botão Excluir */}
          <Pressable
            onPress={handleDelete}
            disabled={deleting || saving}
            className="border-2 border-red-500 rounded-lg py-3 items-center flex-row justify-center mt-6"
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-base ml-2">
              Excluir Cliente
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Botão Fixo */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Pressable
          onPress={handleSave}
          disabled={saving || deleting}
          className={`rounded-lg py-4 items-center ${
            saving || deleting ? 'bg-gray-300' : 'bg-blue-600 active:bg-blue-700'
          }`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Salvar Alterações
            </Text>
          )}
        </Pressable>
      </View>

      {deleting && <LoadingOverlay message="Excluindo cliente..." />}
    </KeyboardAvoidingView>
  );
}
````

---

## Fase 9: Telas de Produtos

### 9.1 Layout de Produtos

````typescript
import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Produtos' }} />
      <Stack.Screen
        name="new"
        options={{
          title: 'Novo Produto',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Editar Produto' }}
      />
    </Stack>
  );
}
````

### 9.2 Lista de Produtos

````typescript
import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, Alert, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { Product } from '@/types/database';
import FloatingActionButton from '@/components/FloatingActionButton';
import EmptyState from '@/components/EmptyState';

export default function ProductsListScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  async function loadProducts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      Alert.alert('Erro ao carregar produtos', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function filterProducts() {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
    setFilteredProducts(filtered);
  }

  function onRefresh() {
    setRefreshing(true);
    loadProducts();
  }

  function getStockColor(quantity: number) {
    if (quantity === 0) return 'text-red-600';
    if (quantity < 10) return 'text-yellow-600';
    return 'text-green-600';
  }

  function getStockBgColor(quantity: number) {
    if (quantity === 0) return 'bg-red-50';
    if (quantity < 10) return 'bg-yellow-50';
    return 'bg-green-50';
  }

  function renderProductItem({ item }: { item: Product }) {
    return (
      <Pressable
        onPress={() => router.push(`/products/${item.id}`)}
        className="bg-white rounded-lg p-4 mb-3 shadow-sm active:bg-gray-50"
        style={{ elevation: 2 }}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {item.name}
            </Text>
            {item.description && (
              <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          <View className={`ml-3 px-3 py-1.5 rounded-lg ${getStockBgColor(item.stock_quantity)}`}>
            <Text className={`text-sm font-bold ${getStockColor(item.stock_quantity)}`}>
              {item.stock_quantity}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Ionicons name="cube-outline" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-600 ml-1">
              {item.stock_quantity === 0 ? 'Sem estoque' : 
               item.stock_quantity === 1 ? '1 unidade' : 
               `${item.stock_quantity} unidades`}
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Barra de Pesquisa */}
      <View className="bg-white p-4 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar produto..."
            className="flex-1 ml-2 text-gray-900"
            placeholderTextColor="#9ca3af"
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Resumo do Estoque */}
      {products.length > 0 && (
        <View className="bg-white mx-4 mt-4 rounded-lg p-4 shadow-sm" style={{ elevation: 2 }}>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Resumo do Estoque
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {products.length}
              </Text>
              <Text className="text-xs text-gray-600">Produtos</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {products.reduce((acc, p) => acc + p.stock_quantity, 0)}
              </Text>
              <Text className="text-xs text-gray-600">Total em Estoque</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock_quantity === 0).length}
              </Text>
              <Text className="text-xs text-gray-600">Sem Estoque</Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Nenhum produto encontrado"
            message={
              searchQuery
                ? 'Tente buscar com outros termos'
                : 'Adicione seu primeiro produto para começar'
            }
          />
        }
      />

      <FloatingActionButton
        onPress={() => router.push('/products/new')}
        icon="add"
      />
    </View>
  );
}
````

### 9.3 Novo Produto

````typescript
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

export default function NewProductScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [loading, setLoading] = useState(false);

  function handleQuantityChange(text: string) {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    setStockQuantity(numbers || '0');
  }

  function adjustQuantity(amount: number) {
    const current = parseInt(stockQuantity) || 0;
    const newValue = Math.max(0, current + amount);
    setStockQuantity(newValue.toString());
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Digite o nome do produto');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          stock_quantity: parseInt(stockQuantity) || 0,
        });

      if (error) throw error;

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro ao cadastrar produto', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView>
        <View className="p-4">
          {/* Nome */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nome do Produto <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Bolo de Chocolate"
              autoCapitalize="words"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Descrição */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Descrição (Opcional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Bolo de chocolate com cobertura de brigadeiro"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Quantidade em Estoque */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Quantidade em Estoque
            </Text>
            <View className="bg-white border border-gray-300 rounded-lg flex-row items-center">
              <Pressable
                onPress={() => adjustQuantity(-1)}
                className="w-12 h-12 items-center justify-center border-r border-gray-300"
              >
                <Ionicons name="remove" size={24} color="#2563eb" />
              </Pressable>
              
              <TextInput
                value={stockQuantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                className="flex-1 text-center text-2xl font-bold text-gray-900"
              />
              
              <Pressable
                onPress={() => adjustQuantity(1)}
                className="w-12 h-12 items-center justify-center border-l border-gray-300"
              >
                <Ionicons name="add" size={24} color="#2563eb" />
              </Pressable>
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              Você pode ajustar depois usando os botões + e -
            </Text>
          </View>

          {/* Info */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-row">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text className="text-xs text-blue-800 ml-2 flex-1">
              Controle seu estoque e saiba quando repor seus produtos
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botão Fixo */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Pressable
          onPress={handleSave}
          disabled={loading}
          className={`rounded-lg py-4 items-center ${
            loading ? 'bg-gray-300' : 'bg-blue-600 active:bg-blue-700'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Salvar Produto
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
````

# Guia Completo de Implementação - Ponto de Partida (Continuação)

## Fase 9: Telas de Produtos (Continuação)

### 9.4 Editar Produto

````typescript
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { Product } from '@/types/database';
import LoadingOverlay from '@/components/LoadingOverlay';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setProduct(data);
      setName(data.name);
      setDescription(data.description || '');
      setStockQuantity(data.stock_quantity.toString());
    } catch (error: any) {
      Alert.alert('Erro ao carregar produto', error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function handleQuantityChange(text: string) {
    const numbers = text.replace(/\D/g, '');
    setStockQuantity(numbers || '0');
  }

  function adjustQuantity(amount: number) {
    const current = parseInt(stockQuantity) || 0;
    const newValue = Math.max(0, current + amount);
    setStockQuantity(newValue.toString());
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Digite o nome do produto');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          stock_quantity: parseInt(stockQuantity) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro ao atualizar produto', error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Excluir Produto',
      `Tem certeza que deseja excluir ${product?.name}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  }

  async function confirmDelete() {
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Produto excluído com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Erro ao excluir produto', error.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return <LoadingOverlay message="Carregando produto..." />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <ScrollView>
        <View className="p-4">
          {/* Nome */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nome do Produto <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Bolo de Chocolate"
              autoCapitalize="words"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Descrição */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Descrição (Opcional)
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Bolo de chocolate com cobertura de brigadeiro"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          {/* Quantidade em Estoque */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Quantidade em Estoque
            </Text>
            <View className="bg-white border border-gray-300 rounded-lg flex-row items-center">
              <Pressable
                onPress={() => adjustQuantity(-1)}
                className="w-12 h-12 items-center justify-center border-r border-gray-300 active:bg-gray-50"
              >
                <Ionicons name="remove" size={24} color="#2563eb" />
              </Pressable>
              
              <TextInput
                value={stockQuantity}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                className="flex-1 text-center text-2xl font-bold text-gray-900"
              />
              
              <Pressable
                onPress={() => adjustQuantity(1)}
                className="w-12 h-12 items-center justify-center border-l border-gray-300 active:bg-gray-50"
              >
                <Ionicons name="add" size={24} color="#2563eb" />
              </Pressable>
            </View>
          </View>

          {/* Atalhos Rápidos */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Ajustes Rápidos
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => adjustQuantity(5)}
                className="flex-1 bg-blue-50 border border-blue-200 rounded-lg py-2 items-center"
              >
                <Text className="text-blue-600 font-semibold">+5</Text>
              </Pressable>
              <Pressable
                onPress={() => adjustQuantity(10)}
                className="flex-1 bg-blue-50 border border-blue-200 rounded-lg py-2 items-center"
              >
                <Text className="text-blue-600 font-semibold">+10</Text>
              </Pressable>
              <Pressable
                onPress={() => setStockQuantity('0')}
                className="flex-1 bg-red-50 border border-red-200 rounded-lg py-2 items-center"
              >
                <Text className="text-red-600 font-semibold">Zerar</Text>
              </Pressable>
            </View>
          </View>

          {/* Botão Excluir */}
          <Pressable
            onPress={handleDelete}
            disabled={deleting || saving}
            className="border-2 border-red-500 rounded-lg py-3 items-center flex-row justify-center mt-6"
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-base ml-2">
              Excluir Produto
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Botão Fixo */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Pressable
          onPress={handleSave}
          disabled={saving || deleting}
          className={`rounded-lg py-4 items-center ${
            saving || deleting ? 'bg-gray-300' : 'bg-blue-600 active:bg-blue-700'
          }`}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Salvar Alterações
            </Text>
          )}
        </Pressable>
      </View>

      {deleting && <LoadingOverlay message="Excluindo produto..." />}
    </KeyboardAvoidingView>
  );
}
````

---

## Fase 10: Tela de Conta

````typescript
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';

export default function AccountScreen() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(session: Session) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!session) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          username: username.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro ao atualizar perfil', error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Header com Avatar */}
        <View className="bg-white rounded-lg p-6 items-center mb-4 shadow-sm" style={{ elevation: 2 }}>
          <View className="bg-blue-600 rounded-full w-20 h-20 items-center justify-center mb-3">
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text className="text-xl font-bold text-gray-900">
            {fullName || 'Usuário'}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            {session?.user.email}
          </Text>
        </View>

        {/* Formulário de Perfil */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm" style={{ elevation: 2 }}>
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Informações do Perfil
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Seu nome completo"
              autoCapitalize="words"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Nome de Usuário
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="@usuario"
              autoCapitalize="none"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
            />
          </View>

          <Pressable
            onPress={handleSaveProfile}
            disabled={saving}
            className={`rounded-lg py-3 items-center ${
              saving ? 'bg-gray-300' : 'bg-blue-600 active:bg-blue-700'
            }`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                Salvar Alterações
              </Text>
            )}
          </Pressable>
        </View>

        {/* Informações da Conta */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm" style={{ elevation: 2 }}>
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Informações da Conta
          </Text>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons name="mail-outline" size={20} color="#6b7280" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-600">Email</Text>
              <Text className="text-sm text-gray-900 mt-0.5">
                {session?.user.email}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3">
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-600">Membro desde</Text>
              <Text className="text-sm text-gray-900 mt-0.5">
                {session?.user.created_at
                  ? new Date(session.user.created_at).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sobre o App */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm" style={{ elevation: 2 }}>
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Sobre o App
          </Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700">Versão</Text>
            <Text className="text-gray-600">1.0.0</Text>
          </View>

          <Pressable className="flex-row items-center justify-between py-3">
            <Text className="text-gray-700">Termos de Uso</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Botão Sair */}
        <Pressable
          onPress={handleSignOut}
          className="bg-red-500 rounded-lg py-4 items-center flex-row justify-center active:bg-red-600 mb-8"
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white font-semibold text-base ml-2">
            Sair da Conta
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
````

---

## Fase 11: Configurar Variáveis de Ambiente

````bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Maps API
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
````

````bash
# Copie .env.example para .env e preencha com suas chaves
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX
````

### Atualizar supabase.ts para usar variáveis de ambiente

````typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
````

---

## Fase 12: Checklist Final de Implementação

### ✅ Banco de Dados
- [ ] Criar tabela `profiles` com trigger de signup
- [ ] Criar tabela `clients` com RLS
- [ ] Criar tabela `products` com RLS
- [ ] Criar tabela `routes` com RLS
- [ ] Criar tabela `route_stops` com RLS
- [ ] Testar todas as policies no SQL Editor

### ✅ Autenticação
- [ ] Implementar index.tsx (controlador de rota)
- [ ] Implementar `app/login.tsx`
- [ ] Implementar `app/signup.tsx`
- [ ] Testar fluxo completo de auth

### ✅ Navegação Principal
- [ ] Criar _layout.tsx com Tabs
- [ ] Configurar ícones e cores das tabs
- [ ] Testar navegação entre tabs

### ✅ Módulo de Clientes
- [ ] Implementar index.tsx (lista)
- [ ] Implementar new.tsx (criar)
- [ ] Implementar [id].tsx (editar)
- [ ] Criar `app/(app)/clients/_layout.tsx`
- [ ] Testar CRUD completo

### ✅ Módulo de Produtos
- [ ] Implementar index.tsx (lista)
- [ ] Implementar new.tsx (criar)
- [ ] Implementar [id].tsx (editar)
- [ ] Criar `app/(app)/products/_layout.tsx`
- [ ] Testar CRUD completo

### ✅ Módulo de Rotas
- [ ] Implementar index.tsx (lista)
- [ ] Implementar new.tsx (criar)
- [ ] Implementar [id].tsx (detalhes)
- [ ] Criar `app/(app)/routes/_layout.tsx`
- [ ] Testar criação e visualização de rotas

### ✅ Tela de Conta
- [ ] Implementar `app/(app)/account.tsx`
- [ ] Testar edição de perfil
- [ ] Testar logout

### ✅ Componentes Reutilizáveis
- [ ] Criar `components/LoadingOverlay.tsx`
- [ ] Criar `components/FloatingActionButton.tsx`
- [ ] Criar `components/EmptyState.tsx`

### ✅ Types e Utils
- [ ] Criar `types/database.ts`
- [ ] Criar `utils/geocoding.ts`
- [ ] Criar `utils/format.ts`

### ✅ Configurações
- [ ] Configurar variáveis de ambiente (.env)
- [ ] Obter Google Maps API Key
- [ ] Habilitar Geocoding API
- [ ] Habilitar Directions API
- [ ] Configurar billing no Google Cloud

### ✅ Testes
- [ ] Testar em Android
- [ ] Testar em iOS
- [ ] Testar fluxo completo end-to-end

---

## Comandos Úteis

```bash
# Iniciar o projeto
npx expo start

# Limpar cache
npx expo start -c

# Rodar em dispositivo específico
npx expo start --android
npx expo start --ios

# Build de produção
eas build --platform android
eas build --platform ios

# Instalar dependências
npm install

# Atualizar Expo
npx expo install expo@latest

# Verificar dependências
npx expo-doctor
```

---

## Próximos Passos (Pós-MVP)

1. **Notificações Push**
   - Lembrar usuária das rotas do dia
   - Avisar quando estoque estiver baixo

2. **Relatórios e Analytics**
   - Dashboard com métricas
   - Histórico de entregas
   - Produtos mais vendidos

3. **Exportação de Dados**
   - Exportar relatórios em PDF
   - Compartilhar rotas via WhatsApp

4. **Melhorias de UX**
   - Dark mode
   - Modo offline
   - Sincronização em background

5. **Integrações**
   - WhatsApp Business API
   - Sistemas de pagamento
   - Impressão de etiquetas