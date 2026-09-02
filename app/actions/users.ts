'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper untuk otorisasi
async function checkAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'media_admin')) {
    throw new Error('Forbidden')
  }

  return { user, profile }
}

export async function getUsers() {
  const { profile } = await checkAdminAccess()
  const adminClient = createAdminClient()
  
  let query = adminClient
    .from('profiles')
    .select(`
      id,
      email,
      role,
      full_name,
      phone_number,
      created_at,
      lembaga_id,
      lembaga (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (profile.role === 'media_admin') {
    query = query.neq('role', 'super_admin')
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

type CreateUserData = {
  email: string
  password?: string
  full_name: string
  phone_number?: string
  role: 'super_admin' | 'media_admin' | 'lembaga_admin' | 'pimpinan'
  lembaga_id?: string | null
}

export async function createUser(data: CreateUserData) {
  const { profile } = await checkAdminAccess()
  
  if (profile.role === 'media_admin' && data.role === 'super_admin') {
    throw new Error('Media Admin tidak diizinkan membuat Super Admin')
  }

  const adminClient = createAdminClient()

  // 1. Create user di Supabase Auth
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password || 'password123',
    email_confirm: true, // Auto confirm since it's created by admin
    user_metadata: {
      full_name: data.full_name,
    }
  })

  if (authError) {
    throw new Error(authError.message)
  }

  const userId = authData.user.id

  // 2. Insert ke table profiles karena tidak ada trigger otomatis di schema
  const { error: profileError } = await (adminClient.from('profiles') as any)
    .insert({
      id: userId,
      email: data.email,
      full_name: data.full_name,
      phone_number: data.phone_number,
      role: data.role,
      lembaga_id: data.role === 'lembaga_admin' ? data.lembaga_id : null,
    })

  if (profileError) {
    // Rollback jika update profile gagal? (opsional tapi disarankan)
    // await adminClient.auth.admin.deleteUser(userId)
    throw new Error(profileError.message)
  }

  revalidatePath('/dashboard/users')
  return { success: true, user: authData.user }
}

type UpdateUserData = {
  email?: string
  password?: string
  full_name?: string
  phone_number?: string
  role?: 'super_admin' | 'media_admin' | 'lembaga_admin' | 'pimpinan'
  lembaga_id?: string | null
}

export async function updateUser(id: string, data: UpdateUserData) {
  const { profile } = await checkAdminAccess()
  const adminClient = createAdminClient()

  if (profile.role === 'media_admin') {
    // Media admin tidak boleh mengedit data super admin
    const supabase = await createClient()
    const { data: targetProfile } = await (supabase.from('profiles') as any).select('role').eq('id', id).single()
    if (targetProfile?.role === 'super_admin') {
      throw new Error('Media Admin tidak diizinkan mengubah Super Admin')
    }
    // Media admin tidak boleh mengubah role seseorang menjadi super admin
    if (data.role === 'super_admin') {
      throw new Error('Media Admin tidak diizinkan mengubah role menjadi Super Admin')
    }
  }

  // 1. Update Auth (Email atau Password jika ada)
  if (data.email || data.password) {
    const authUpdates: { email?: string, password?: string, user_metadata?: any } = {}
    if (data.email) authUpdates.email = data.email
    if (data.password) authUpdates.password = data.password
    if (data.full_name) authUpdates.user_metadata = { full_name: data.full_name }

    const { error: authError } = await adminClient.auth.admin.updateUserById(
      id,
      authUpdates
    )

    if (authError) throw new Error(authError.message)
  }

  // 2. Update Profile
  const profileUpdates: any = {}
  if (data.full_name !== undefined) profileUpdates.full_name = data.full_name
  if (data.phone_number !== undefined) profileUpdates.phone_number = data.phone_number
  if (data.role !== undefined) profileUpdates.role = data.role
  if (data.lembaga_id !== undefined) {
     profileUpdates.lembaga_id = data.role === 'lembaga_admin' ? data.lembaga_id : null
  } else if (data.role && data.role !== 'lembaga_admin') {
     profileUpdates.lembaga_id = null
  }

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await (adminClient.from('profiles') as any)
      .update(profileUpdates)
      .eq('id', id)

    if (profileError) throw new Error(profileError.message)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const { profile } = await checkAdminAccess()
  
  if (profile.role === 'media_admin') {
    // Media admin tidak boleh menghapus super admin
    const supabase = await createClient()
    const { data: targetProfile } = await (supabase.from('profiles') as any).select('role').eq('id', id).single()
    if (targetProfile?.role === 'super_admin') {
      throw new Error('Media Admin tidak diizinkan menghapus Super Admin')
    }
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient.auth.admin.deleteUser(id)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}
