import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY

function getSupabaseConfigError(url, key) {
  if (!url || !key) {
    return 'Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to My-project/.env. You can also use VITE_SUPABASE_ANON_KEY for a legacy anon key.'
  }
  if (/your-project-id|your-publishable-key|your-supabase/i.test(`${url} ${key}`)) {
    return 'Replace the example Supabase URL and key in My-project/.env with the real values from your Supabase project.'
  }
  if (key.length < 20) {
    return 'The Supabase key in My-project/.env looks incomplete. Copy the full publishable key or legacy anon key from Project Settings → API.'
  }

  try {
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return 'VITE_SUPABASE_URL must start with https:// (or http:// for a local Supabase instance).'
    }
  } catch {
    return 'VITE_SUPABASE_URL in My-project/.env is not a valid URL. Copy the Project URL from Supabase → Project Settings → API.'
  }

  return ''
}

export const supabaseConfigError = getSupabaseConfigError(supabaseUrl, supabasePublishableKey)
export const isSupabaseConfigured = !supabaseConfigError
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null
