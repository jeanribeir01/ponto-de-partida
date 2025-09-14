import { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import { supabase } from '../utils/supabase'

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="mt-10 p-3">
      <View className="mb-3">
        <Text className="text-sm text-gray-600 mb-1">Email</Text>
        <Text className="border rounded px-3 py-2 bg-gray-100">{session?.user?.email}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-sm text-gray-600 mb-1">Username</Text>
        <TextInput className="border rounded px-3 py-2" value={username} onChangeText={setUsername} />
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Website</Text>
        <TextInput className="border rounded px-3 py-2" value={website} onChangeText={setWebsite} />
      </View>

      <Pressable
        onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
        className="bg-blue-600 rounded py-3 items-center mb-3"
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white">Update</Text>}
      </Pressable>

      <Pressable onPress={() => supabase.auth.signOut()} className="bg-gray-200 rounded py-3 items-center">
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  )
}