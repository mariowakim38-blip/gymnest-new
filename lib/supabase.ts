import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://znsakxenacqakqtzqmfi.supabase.co"
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YXR0Y3lnb3ZibmNyeGNiaXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjc3OTQsImV4cCI6MjA5MjYwMzc5NH0.iBqGalKditCC2swmjQ2By-TGsCCT52cvJsuSOnAFYOY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
