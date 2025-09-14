import React, { useState } from 'react'
import { ActivityIndicator, Alert, AppState, Pressable, Text, TextInput, View } from 'react-native'
import { supabase } from '../utils/supabase'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <View className="mt-10 p-3">
      <View className="mb-3">
        <Text className="text-sm text-gray-600 mb-1">Email</Text>
        <TextInput
          className="border rounded px-3 py-2"
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Password</Text>
        <TextInput
          className="border rounded px-3 py-2"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          placeholder="Password"
          autoCapitalize="none"
        />
      </View>
      <Pressable
        onPress={signInWithEmail}
        className="bg-blue-600 rounded py-3 items-center mb-3"
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-medium">Sign in</Text>}
      </Pressable>
      <Pressable
        onPress={signUpWithEmail}
        className="bg-gray-200 rounded py-3 items-center"
        disabled={loading}
      >
        <Text className="text-black">Sign up</Text>
      </Pressable>
    </View>
  )
}