import { Session } from '@supabase/supabase-js'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Account from '../components/Account'
import Auth from '../components/Auth'
import { supabase } from '../utils/supabase'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (!session || !session.user) {
    return (
      <View className="flex-1 justify-center">
        <Auth />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Dashboard</Text>
        
        <Pressable
          onPress={() => router.push('./clientes')}
          className="bg-blue-600 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-semibold text-lg text-center">
            Gerenciar Clientes
          </Text>
        </Pressable>
      </View>

      <Account key={session.user.id} session={session} />
    </View>
  )
}