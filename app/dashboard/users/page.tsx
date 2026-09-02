import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserTable } from '@/components/users/user-table'
import { getUsers } from '@/app/actions/users'

export const metadata: Metadata = {
  title: 'Pengelolaan User',
  description: 'Kelola akun pengguna, role, dan lembaga',
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cek apakah user memiliki role yang valid (super_admin / media_admin)
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'media_admin')) {
    // Redirect ke dashboard biasa jika bukan admin
    redirect('/dashboard')
  }

  // Fetch data
  const users = await getUsers()
  const { data: lembagas } = await supabase
    .from('lembaga')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <UserTable users={users || []} lembagas={lembagas || []} />
    </div>
  )
}
