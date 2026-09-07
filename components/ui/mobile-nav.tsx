'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Plus, Users, CheckSquare, User } from 'lucide-react'
import { ProfileSheet } from '@/components/profile/ProfileSheet'

interface MobileNavProps {
  role: string | undefined
  user: any
  profileData: any
}

export function MobileNav({ role, user, profileData }: MobileNavProps) {
  const pathname = usePathname()

  if (!user) return null

  // Helper to determine if a route is active
  const isActive = (path: string) => pathname === path || (path !== '/dashboard' && pathname.startsWith(path))

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {/* BERANDA - All Roles */}
        <Link href="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/dashboard') && pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
          <Home className={`w-5 h-5 ${isActive('/dashboard') && pathname === '/dashboard' ? 'fill-blue-100' : ''}`} />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>

        {/* LEMBAGA ADMIN MENUS */}
        {role === 'lembaga_admin' && (
          <>
            <Link href="/pengajuan" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/pengajuan') && pathname !== '/pengajuan/baru' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
              <FileText className={`w-5 h-5 ${isActive('/pengajuan') && pathname !== '/pengajuan/baru' ? 'fill-blue-100' : ''}`} />
              <span className="text-[10px] font-medium">Pengajuan</span>
            </Link>

            {/* FAB for Create New */}
            <div className="relative w-full flex justify-center h-full">
              <Link href="/pengajuan/baru" className="absolute -top-5 flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all text-white border-4 border-slate-50">
                <Plus className="w-6 h-6" />
              </Link>
            </div>
          </>
        )}

        {/* MEDIA ADMIN & SUPER ADMIN MENUS */}
        {(role === 'media_admin' || role === 'super_admin') && (
          <>
            <Link href="/media/pengajuan" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/media/pengajuan') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
              <CheckSquare className={`w-5 h-5 ${isActive('/media/pengajuan') ? 'fill-blue-100' : ''}`} />
              <span className="text-[10px] font-medium">Review</span>
            </Link>
            <Link href="/dashboard/users" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/dashboard/users') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
              <Users className={`w-5 h-5 ${isActive('/dashboard/users') ? 'fill-blue-100' : ''}`} />
              <span className="text-[10px] font-medium">Pengguna</span>
            </Link>
          </>
        )}

        {/* PIMPINAN MENUS */}
        {role === 'pimpinan' && (
          <>
            <Link href="/media/pengajuan" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/media/pengajuan') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
              <CheckSquare className={`w-5 h-5 ${isActive('/media/pengajuan') ? 'fill-blue-100' : ''}`} />
              <span className="text-[10px] font-medium">Persetujuan</span>
            </Link>
          </>
        )}

        {/* PROFIL - All Roles */}
        <ProfileSheet initialData={{ 
          id: user.id, 
          email: user.email || '', 
          full_name: profileData?.full_name, 
          phone_number: profileData?.phone_number, 
          avatar_url: profileData?.avatar_url 
        }}>
          <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-slate-900 px-4">
            {profileData?.avatar_url ? (
              <img src={profileData.avatar_url} alt="Profil" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium">Profil</span>
          </button>
        </ProfileSheet>

      </div>
    </div>
  )
}
