import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbkaghekauuerzxmdpot.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia2FnaGVrYXV1ZXJ6eG1kcG90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzkyNzAsImV4cCI6MjA5MjYxNTI3MH0.JJUozmD9slF4OqRX_z9vL8xtt9YCyo1TqSWA-YD1u0w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
