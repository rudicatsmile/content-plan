import * as z from 'zod'

export const submissionSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(150, 'Judul maksimal 150 karakter'),
  description: z.string().max(1000, 'Keterangan maksimal 1000 karakter').optional(),
  upload_date: z.date({
    required_error: 'Tanggal upload wajib diisi',
  }),
  platforms: z.array(z.string()).min(1, 'Pilih minimal 1 platform'),
  content_type_id: z.string({ required_error: 'Pilih jenis konten' }).min(1, 'Pilih jenis konten'),
  priority: z.enum(['biasa', 'urgent']).default('biasa'),
  media_urls: z.array(z.object({
    url: z.string(),
    type: z.string(),
    name: z.string(),
    size: z.number().optional(),
  })).optional(),
  id: z.string().optional(), // Client-generated ID (no longer requires .uuid() since we may use 'temp-xxx')
})

export type SubmissionFormValues = z.infer<typeof submissionSchema>
