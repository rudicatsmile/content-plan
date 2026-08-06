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
import { ImageUploader } from '@/components/ui/image-uploader'

import { submissionSchema, type SubmissionFormValues } from '@/lib/validations/submission'
import { createSubmission } from '@/app/actions/submissions'

interface SubmissionFormProps {
  lembagaId: string
  platforms: { id: string; name: string }[]
}

export function SubmissionForm({ lembagaId, platforms }: SubmissionFormProps) {
  const router = useRouter()
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false)
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false)
  
  // Use crypto.randomUUID for client-side UUID generation if available, else a fallback
  const submissionId = useMemo(() => {
    return typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'temp-' + Date.now()
  }, [])

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      title: '',
      description: '',
      platforms: [],
      image_url: '',
      id: submissionId,
    },
  })

  async function onSubmit(data: SubmissionFormValues, isDraft: boolean) {
    if (isDraft) setIsSubmittingDraft(true)
    else setIsSubmittingFinal(true)

    try {
      await createSubmission(data, isDraft)
      router.push('/pengajuan')
      router.refresh()
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Gagal menyimpan pengajuan')
    } finally {
      setIsSubmittingDraft(false)
      setIsSubmittingFinal(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8 max-w-3xl">
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gambar Konten</FormLabel>
              <FormControl>
                <ImageUploader 
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
          name="platforms"
          render={() => (
            <FormItem>
              <FormLabel>Platform Sosmed</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {platforms.map((platform) => (
                  <FormField
                    key={platform.id}
                    control={form.control}
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
                                        (value) => value !== platform.id
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

        <div className="flex gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmittingDraft || isSubmittingFinal}
            onClick={() => form.handleSubmit((data) => onSubmit(data, true))()}
          >
            {isSubmittingDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Draft
          </Button>
          <Button
            type="button"
            disabled={isSubmittingDraft || isSubmittingFinal}
            onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
          >
            {isSubmittingFinal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ajukan Sekarang
          </Button>
        </div>
      </form>
    </Form>
  )
}
