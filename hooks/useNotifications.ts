import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useNotifications() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    refetchOnWindowFocus: true,
  })
}
