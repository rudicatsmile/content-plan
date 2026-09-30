'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Helper to check authorization and return admin client
async function checkAuthAndGetAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'media_admin')) {
    throw new Error('Forbidden: Insufficient privileges')
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  return supabaseAdmin
}

export async function getLembagas() {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('lembaga') as any)
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching lembagas:', error)
    return []
  }
  return data
}

export async function createLembaga(data: { name: string; sort_order: number }) {
  try {
    const supabaseAdmin = await checkAuthAndGetAdmin()
    const { error } = await (supabaseAdmin.from('lembaga') as any).insert({
      name: data.name,
      sort_order: data.sort_order || 0
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateLembaga(id: string, data: { name: string; sort_order: number }) {
  try {
    const supabaseAdmin = await checkAuthAndGetAdmin()
    const { error } = await (supabaseAdmin.from('lembaga') as any).update({
      name: data.name,
      sort_order: data.sort_order || 0
    }).eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteLembaga(id: string) {
  try {
    const supabaseAdmin = await checkAuthAndGetAdmin()
    const { error } = await (supabaseAdmin.from('lembaga') as any).delete().eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
