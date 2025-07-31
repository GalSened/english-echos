import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Settings table for storing global app settings
export const getOpenAIKey = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'openai_api_key')
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching OpenAI key:', error)
    return null
  }
  
  return data?.value || null
}

export const setOpenAIKey = async (apiKey: string) => {
  const { error } = await supabase
    .from('settings')
    .upsert({ 
      key: 'openai_api_key', 
      value: apiKey 
    })
  
  if (error) {
    console.error('Error saving OpenAI key:', error)
    throw error
  }
}