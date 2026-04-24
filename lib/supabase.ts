import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://znsakxenacqakqtzqmfi.supabase.co"
const supabaseAnonKey = sb_publishable_YWAuQxlCJ8MMwXf_r38eUw_XzEWjTr6

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
