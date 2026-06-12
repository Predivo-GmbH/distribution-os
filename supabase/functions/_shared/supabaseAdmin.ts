import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = Deno.env.get('SUPABASE_URL')
    // SB_SECRET_KEY (sb_secret_...) replaces the legacy service_role JWT —
    // the injected SUPABASE_SERVICE_ROLE_KEY stops working once legacy API
    // keys are disabled on the project
    const key = Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SB_SECRET_KEY env vars')
    }
    adminClient = createClient(url, key)
  }
  return adminClient
}
