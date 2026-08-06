import * as z from 'zod'

export const submissionSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(150, 'Judul maksimal 150 karakter'),
  description: z.string().max(1000, 'Keterangan maksimal 1000 karakter').optional(),
  upload_date: z.date({
    required_error: 'Tanggal upload wajib diisi',
  }),
  platforms: z.array(z.string()).min(1, 'Pilih minimal 1 platform'),
  image_url: z.string().min(1, 'Gambar wajib diunggah'),
  id: z.string().uuid().optional(), // We'll pre-generate this on client
})

export type SubmissionFormValues = z.infer<typeof submissionSchema>
