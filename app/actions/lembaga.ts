'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
  const supabase = await createClient()
  const { error } = await (supabase.from('lembaga') as any).insert({
    name: data.name,
    sort_order: data.sort_order || 0
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/lembaga')
  return { success: true }
}

export async function updateLembaga(id: string, data: { name: string; sort_order: number }) {
  const supabase = await createClient()
  const { error } = await (supabase.from('lembaga') as any).update({
    name: data.name,
    sort_order: data.sort_order || 0
  }).eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/lembaga')
  return { success: true }
}

export async function deleteLembaga(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('lembaga') as any).delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/lembaga')
  return { success: true }
}
