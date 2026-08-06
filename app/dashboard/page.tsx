import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar'
import { CalendarView } from '@/components/calendar/CalendarView'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, lembaga_id')
    .eq('id', user.id)
    .single() as any

  if (!profile) redirect('/login')

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kalender Konten</h1>
        <p className="text-muted-foreground mt-1">Jadwal publikasi dari seluruh lembaga</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <CalendarSidebar userRole={profile.role} />
        <div className="flex-1 overflow-hidden">
          <CalendarView userRole={profile.role} userLembagaId={profile.lembaga_id} />
        </div>
      </div>
    </div>
  )
}
