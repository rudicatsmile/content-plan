import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LembagaTable } from '@/components/lembaga/lembaga-table'
import { getLembagas } from '@/app/actions/lembaga'

export const metadata: Metadata = {
  title: 'Pengelolaan Lembaga',
  description: 'Kelola data dan urutan lembaga',
}

export default async function LembagaPage() {
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
    redirect('/dashboard')
  }

  const lembagas = await getLembagas()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <LembagaTable lembagas={lembagas || []} />
    </div>
  )
}
