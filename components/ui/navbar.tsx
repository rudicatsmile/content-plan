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
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single() as any
    
    if (profile) userName = profile.name
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
          <div className="flex items-center gap-4">
            {userName && (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4" />
                {userName}
              </div>
            )}
            <NotificationBell />
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" className="text-gray-600 hover:text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
