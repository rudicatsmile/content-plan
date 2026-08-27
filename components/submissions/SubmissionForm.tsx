'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { MultiMediaUploader } from '@/components/ui/multi-media-uploader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { submissionSchema, type SubmissionFormValues } from '@/lib/validations/submission'
import { createSubmission, updateSubmission } from '@/app/actions/submissions'

interface SubmissionFormProps {
  lembagaId: string
  platforms: { id: string; name: string }[]
  contentTypes: { id: string; name: string }[]
  initialData?: any
}

export function SubmissionForm({ lembagaId, platforms = [], contentTypes = [], initialData }: SubmissionFormProps) {
  const router = useRouter()
  const [isSubmittingPlanning, setIsSubmittingPlanning] = useState(false)
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false)
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false)
  
  // Use crypto.randomUUID for client-side UUID generation if available, else a fallback
  const submissionId = useMemo(() => {
    return initialData?.id || (typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'temp-' + Date.now())
  }, [initialData])

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      platforms: initialData?.platforms?.map((p: any) => p.platform_id) || [],
      media_urls: Array.isArray(initialData?.media_urls) ? initialData.media_urls : [],
      content_type_id: initialData?.content_type_id || '',
      priority: initialData?.priority || 'biasa',
      upload_date: initialData?.upload_date ? new Date(initialData.upload_date) : undefined,
      id: submissionId,
    },
  })

  async function onSubmit(data: SubmissionFormValues, targetStatus: 'planning' | 'draft' | 'pending_review') {
    if (targetStatus !== 'planning' && (!data.media_urls || data.media_urls.length === 0)) {
      form.setError('media_urls', { type: 'manual', message: 'Minimal 1 file media wajib diunggah untuk menyimpan Draft atau Mengajukan.' })
      return
    }

    if (targetStatus === 'planning') setIsSubmittingPlanning(true)
    else if (targetStatus === 'draft') setIsSubmittingDraft(true)
    else setIsSubmittingFinal(true)

    try {
      const payload = {
        ...data,
        upload_date: data.upload_date ? format(data.upload_date, 'yyyy-MM-dd') : null
      }

      if (initialData) {
        await updateSubmission(initialData.id, payload, targetStatus)
      } else {
        await createSubmission(payload, targetStatus)
      }
      router.push('/pengajuan')
      router.refresh()
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Gagal menyimpan pengajuan')
    } finally {
      setIsSubmittingPlanning(false)
      setIsSubmittingDraft(false)
      setIsSubmittingFinal(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8 max-w-3xl">
        <FormField
          control={form.control as any}
          name="content_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Konten</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis konten">
                      {contentTypes.find((t) => t.id === field.value)?.name || 'Pilih jenis konten'}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="media_urls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Media</FormLabel>
              <FormControl>
                <MultiMediaUploader 
                  value={field.value} 
                  onChange={field.onChange} 
                  lembagaId={lembagaId}
                  submissionId={submissionId}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Konten</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan judul konten..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tingkat Prioritas</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat prioritas" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="biasa">Biasa</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Tuliskan keterangan / caption..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="upload_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Rencana Upload</FormLabel>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal border border-input rounded-md h-9 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control as any}
          name="platforms"
          render={() => (
            <FormItem>
              <FormLabel>Platform Sosmed</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {platforms.map((platform) => (
                  <FormField
                    key={platform.id}
                    control={form.control as any}
                    name="platforms"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={platform.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              checked={field.value?.includes(platform.id)}
                              onChange={(e) => {
                                return e.target.checked
                                  ? field.onChange([...field.value, platform.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value: string) => value !== platform.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {platform.name}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
            disabled={isSubmittingPlanning || isSubmittingDraft || isSubmittingFinal}
            onClick={form.handleSubmit((data) => onSubmit(data as any, 'planning'))}
          >
            {isSubmittingPlanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Rencana
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmittingPlanning || isSubmittingDraft || isSubmittingFinal}
            onClick={form.handleSubmit((data) => onSubmit(data as any, 'draft'))}
          >
            {isSubmittingDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Draft
          </Button>
          <Button
            type="button"
            disabled={isSubmittingPlanning || isSubmittingDraft || isSubmittingFinal}
            onClick={form.handleSubmit((data) => onSubmit(data as any, 'pending_review'))}
          >
            {isSubmittingFinal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ajukan ke Media
          </Button>
        </div>
      </form>
    </Form>
  )
}
