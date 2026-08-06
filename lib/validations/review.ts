import * as z from 'zod'

export const reviewSchema = z.object({
  decision: z.enum(['approved', 'rejected'], { required_error: 'Pilih keputusan ulasan' }),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.decision === 'rejected' && (!data.notes || data.notes.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Catatan wajib diisi jika menolak pengajuan',
      path: ['notes'],
    });
  }
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
