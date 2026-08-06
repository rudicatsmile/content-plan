import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useCalendarEvents(filters: { lembagaId: string; platformId: string; start?: Date; end?: Date }) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['calendar_events', filters],
    queryFn: async () => {
      let query = supabase.from('content_submissions').select(`
        id, title, upload_date, status, lembaga_id, 
        lembaga:lembaga_id(name)
      `) as any

      if (filters.lembagaId && filters.lembagaId !== 'all') {
        query = query.eq('lembaga_id', filters.lembagaId)
      }
      
      // If we had a platform filter in content_submissions, we would apply it here
      // But platform is a many-to-many relationship (content_submission_platforms). 
      // For MVP, if platform filtering is complex, we might skip it or filter client-side.

      if (filters.start && filters.end) {
        query = query
          .gte('upload_date', filters.start.toISOString())
          .lte('upload_date', filters.end.toISOString())
      }

      const { data, error } = await query
      
      if (error) throw error

      // Transform to FullCalendar event format
      return data.map((sub: any) => {
        let color = '#94a3b8' // draft: gray
        if (sub.status === 'pending_review') color = '#eab308' // yellow
        if (sub.status === 'approved') color = '#22c55e' // green
        if (sub.status === 'rejected' || sub.status === 'cancelled') color = '#ef4444' // red

        return {
          id: sub.id,
          title: `[${sub.lembaga?.name || '?'}] ${sub.title}`,
          date: sub.upload_date,
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            status: sub.status,
            lembaga_id: sub.lembaga_id
          }
        }
      })
    },
    enabled: true,
  })
}
