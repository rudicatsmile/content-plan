import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar'
import { CalendarWrapper } from '@/components/calendar/CalendarWrapper'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { FilterIcon } from 'lucide-react'

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
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kalender Konten</h1>
          <p className="text-muted-foreground mt-1">Jadwal publikasi dari seluruh lembaga</p>
        </div>
        <div className="flex gap-2">
          {/* Mobile Filter Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="flex items-center gap-2" />}>
                <FilterIcon className="w-4 h-4" /> Filter & Menu
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-4 overflow-y-auto">
                <SheetTitle className="sr-only">Filter & Menu</SheetTitle>
                <CalendarSidebar userRole={profile.role} />
              </SheetContent>
            </Sheet>
          </div>
          <Link href={profile.role === 'media_admin' ? '/media/pengajuan' : '/pengajuan'}>
            <Button>Lihat Data Pengajuan</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <CalendarSidebar userRole={profile.role} />
        </div>
        
        {/* Calendar Main Area */}
        <div className="flex-1 overflow-hidden">
          <CalendarWrapper userRole={profile.role} userLembagaId={profile.lembaga_id} />
        </div>
      </div>
    </div>
  )
}
