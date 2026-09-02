import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useSubmissions(filters?: { status?: string; lembagaId?: string }) {
  const supabase = createClient()
  const PAGE_SIZE = 15

  return useInfiniteQuery({
    queryKey: ['submissions', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase.from('content_submissions').select(`
        *,
        publish_permission,
        lembaga:lembaga(name),
        content_types(name),
        platforms:content_submission_platforms(social_platforms(id, name))
      `).order('upload_date', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.lembagaId) {
        query = query.eq('lembaga_id', filters.lembagaId)
      }

      const from = pageParam * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error } = await query.range(from, to)
      if (error) throw error
      return data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined
    }
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
          publish_permission,
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
