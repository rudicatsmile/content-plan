import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { ProfileSheet } from '@/components/profile/ProfileSheet'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userName = ''
  let lembagaName = ''
  let profileData = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, phone_number, avatar_url, lembaga(name)')
      .eq('id', user.id)
      .single() as any
    
    if (profile) {
      profileData = profile
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
              <ProfileSheet initialData={{ 
                id: user!.id, 
                email: user!.email || '', 
                full_name: profileData?.full_name, 
                phone_number: profileData?.phone_number, 
                avatar_url: profileData?.avatar_url 
              }}>
                <button className="flex flex-row items-center gap-2 md:gap-3 mr-0 md:mr-2 text-left hover:bg-slate-50 p-1 md:p-2 rounded-md transition-colors border border-transparent hover:border-slate-200 cursor-pointer">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-800">{userName}</span>
                    {lembagaName && <span className="text-xs text-slate-500">{lembagaName}</span>}
                  </div>
                  {profileData?.avatar_url ? (
                    <img src={profileData.avatar_url} alt="Avatar" className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </ProfileSheet>
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
