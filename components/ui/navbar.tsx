import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/NotificationBell'

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
          </div>
        </div>
      </div>
    </nav>
  )
}
