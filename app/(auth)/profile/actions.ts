'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { full_name: string; phone_number: string; avatar_url?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await (supabase.from('profiles') as any)
    .update({
      full_name: data.full_name,
      phone_number: data.phone_number,
      avatar_url: data.avatar_url,
    })
    .eq('id', user.id)

  if (error) {
    throw error
  }

  revalidatePath('/', 'layout')
}

export async function updatePassword(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    throw error
  }
}
