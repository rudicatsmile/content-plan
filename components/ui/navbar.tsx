import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function Navbar() {
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
