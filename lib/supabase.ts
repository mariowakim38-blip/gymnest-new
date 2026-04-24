import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hnkncuqckibrowronjyq.supabase.co"
const supabaseAnonKey = "sb_publishable_PRegJ_OyKljvM-x3yC1-pg_enJREOZs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
