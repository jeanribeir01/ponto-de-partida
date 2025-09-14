import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://cviqywvhhzyzedynrpkx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aXF5d3ZoaHp5emVkeW5ycGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjIwNjcsImV4cCI6MjA3MzA5ODA2N30.OubxygstW2mlGqOV6ZBGA55siIbbeSEmiYMuvlM8sl4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
