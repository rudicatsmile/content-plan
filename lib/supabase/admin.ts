import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Gunakan ini HANYA di lingkungan server (Server Actions / Route Handlers)
// Ini memiliki hak akses admin penuh dan mem-bypass RLS!
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase env vars for admin client')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
