import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useSubmissions(filters?: { status?: string; lembagaId?: string }) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['submissions', filters],
    queryFn: async () => {
      let query = supabase.from('content_submissions').select(`
        *,
        lembaga:lembaga(name),
        content_types(name),
        platforms:content_submission_platforms(social_platforms(id, name))
      `).order('upload_date', { ascending: true })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.lembagaId) {
        query = query.eq('lembaga_id', filters.lembagaId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useSubmission(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_submissions')
        .select(`
          *,
          lembaga:lembaga(name),
          content_types(name),
          platforms:content_submission_platforms(social_platforms(id, name, icon_url)),
          reviews:submission_reviews(id, decision, notes, created_at, reviewer:profiles(full_name))
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}
