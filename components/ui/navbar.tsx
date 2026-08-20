import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userName = ''
  let lembagaName = ''
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, lembaga(name)')
      .eq('id', user.id)
      .single() as any
    
    if (profile) {
      userName = profile.full_name || user.email?.split('@')[0] || 'User'
      lembagaName = profile.lembaga?.name || (profile.role === 'super_admin' ? 'Super Admin' : profile.role === 'media_admin' ? 'Media Admin' : profile.role === 'pimpinan' ? 'Pimpinan' : '')
    }
  }

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-slate-800">
              Content Plan
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {userName && (
              <div className="hidden sm:flex flex-col items-end mr-0 md:mr-2">
                <span className="text-sm font-semibold text-slate-800">{userName}</span>
                {lembagaName && <span className="text-xs text-slate-500">{lembagaName}</span>}
              </div>
            )}
            <NotificationBell />
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" className="text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 md:px-3">
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Keluar</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
