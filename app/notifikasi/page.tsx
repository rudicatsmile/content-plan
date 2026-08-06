'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { markAsRead, markAllAsRead } from '@/app/actions/notifications'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'

export default function NotifikasiPage() {
  const { data: notifications, isLoading } = useNotifications()
  const queryClient = useQueryClient()

  if (isLoading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Semua Notifikasi</h1>
        <Button 
          variant="outline" 
          onClick={async () => {
            await markAllAsRead()
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
          }}
        >
          Tandai Semua Dibaca
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {!notifications || notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Belum ada notifikasi.</div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n: any) => (
              <div 
                key={n.id} 
                className={`p-6 border-b last:border-0 hover:bg-slate-50 transition cursor-pointer flex justify-between items-start ${!n.is_read ? 'bg-blue-50/30' : ''}`}
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
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{n.title}</h3>
                    {!n.is_read && <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Baru</span>}
                  </div>
                  <p className="text-gray-600 mt-1">{n.message}</p>
                </div>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {format(new Date(n.created_at), 'dd MMM yyyy HH:mm')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
