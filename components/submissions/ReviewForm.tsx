'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reviewSchema, type ReviewFormValues } from '@/lib/validations/review'
import { reviewSubmission } from '@/app/actions/reviews'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export function ReviewForm({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      decision: undefined,
      notes: '',
    },
  })

  async function onSubmit(data: ReviewFormValues, decision: 'approved' | 'rejected') {
    setIsSubmitting(true)
    try {
      const result = await reviewSubmission(submissionId, decision, data.notes || '')
      if (result && result.error) {
        throw new Error(result.error)
      }
      alert(`Pengajuan berhasil di-${decision === 'approved' ? 'setujui' : 'tolak'}`)
      router.push('/media/pengajuan')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Gagal menyimpan ulasan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-6 bg-slate-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold">Berikan Ulasan / Persetujuan</h3>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan (Wajib jika revisi/tolak)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Berikan catatan revisi atau alasan penolakan di sini..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
            onClick={() => {
              form.setValue('decision', 'approved')
              form.handleSubmit((data) => onSubmit(data, 'approved'))()
            }}
          >
            {isSubmitting && form.getValues('decision') === 'approved' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Setujui Konten
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={() => {
              form.setValue('decision', 'rejected')
              form.handleSubmit((data) => onSubmit(data, 'rejected'))()
            }}
          >
            {isSubmitting && form.getValues('decision') === 'rejected' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tolak / Minta Revisi
          </Button>
        </div>
      </form>
    </Form>
  )
}
