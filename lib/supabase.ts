import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://znsakxenacqakqtzqmfi.supabase.co"
const supabaseAnonKey = "PASTE_YOUR_ANON_KEY_HERE"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
