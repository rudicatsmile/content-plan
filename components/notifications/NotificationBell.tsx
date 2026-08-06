'use client'

import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotifications } from '@/hooks/useNotifications'
import { markAsRead, markAllAsRead } from '@/app/actions/notifications'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function NotificationBell() {
  const { data: notificationsRaw } = useNotifications()
  const notifications = notificationsRaw as any[]
  const queryClient = useQueryClient()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
        (payload: any) => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          toast(payload.new.title, {
            description: payload.new.message,
            action: {
              label: 'Lihat',
              onClick: () => payload.new.submission_id ? window.location.href = `/pengajuan/${payload.new.submission_id}` : null
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient, supabase])

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  return (
    <Popover>
      <PopoverTrigger className="relative p-2 rounded-full hover:bg-gray-100 transition">
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifikasi</h4>
          {unreadCount > 0 && (
            <button 
              onClick={async () => {
                await markAllAsRead()
                queryClient.invalidateQueries({ queryKey: ['notifications'] })
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">Belum ada notifikasi</div>
          ) : (
            <div className="flex flex-col">
              {notifications.slice(0, 10).map(n => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b last:border-0 hover:bg-slate-50 transition cursor-pointer ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                  onClick={async () => {
                    if (!n.is_read) {
                      await markAsRead(n.id)
                      queryClient.invalidateQueries({ queryKey: ['notifications'] })
                    }
                    if (n.submission_id) {
                      window.location.href = `/pengajuan/${n.submission_id}`
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{n.title}</span>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{n.message}</p>
                  <span className="text-[10px] text-gray-400">{format(new Date(n.created_at), 'dd MMM HH:mm')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t text-center">
          <Link href="/notifikasi" className="text-xs text-blue-600 hover:underline block p-2">
            Lihat Semua Notifikasi
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
