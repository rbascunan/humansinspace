import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

// Session lives in localStorage so auth also works inside third-party iframes (v0 preview),
// where SameSite cookies are blocked. Server actions receive the access token explicitly.
export function createClient() {
  client ??= createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'his-auth' },
  })
  return client
}
