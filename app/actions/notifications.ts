'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAsRead(id: string) {
  const supabase = await createClient()
  const query = supabase.from('notifications') as any
  const { error } = await query
    .update({ is_read: true })
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const query = supabase.from('notifications') as any
  const { error } = await query
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)
  
  if (error) throw error
  return { success: true }
}
