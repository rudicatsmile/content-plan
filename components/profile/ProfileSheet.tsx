'use client'

import { useState } from 'react'
import { updateProfile, updatePassword } from '@/app/(auth)/profile/actions'
import { createClient } from '@/lib/supabase/client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Camera } from 'lucide-react'
import imageCompression from 'browser-image-compression'

interface ProfileSheetProps {
  children: React.ReactNode
  initialData: {
    id: string
    full_name: string | null
    phone_number: string | null
    avatar_url: string | null
    email: string
  }
}

export function ProfileSheet({ children, initialData }: ProfileSheetProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Profile State
  const [fullName, setFullName] = useState(initialData.full_name || '')
  const [phoneNumber, setPhoneNumber] = useState(initialData.phone_number || '')
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  
  // Password State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  
  const supabase = createClient()

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setIsUploading(true)
    try {
      // Compress image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      })

      const ext = file.name.split('.').pop()
      const filename = `${initialData.id}-${Date.now()}.${ext}`
      const filePath = `avatars/${filename}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Gagal mengunggah foto profil')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      await updateProfile({
        full_name: fullName,
        phone_number: phoneNumber,
        avatar_url: avatarUrl,
      })
      alert('Profil berhasil diperbarui!')
    } catch (error) {
      console.error(error)
      alert('Gagal memperbarui profil.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSavePassword = async () => {
    if (newPassword.length < 6) {
      return alert('Kata sandi minimal 6 karakter')
    }
    if (newPassword !== confirmPassword) {
      return alert('Konfirmasi kata sandi tidak cocok')
    }

    setIsSavingPassword(true)
    try {
      await updatePassword(newPassword)
      alert('Kata sandi berhasil diubah! Silakan login ulang jika diperlukan.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Gagal mengubah kata sandi.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={children as React.ReactElement} />
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Pengaturan Akun</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Edit Profil</TabsTrigger>
              <TabsTrigger value="password">Ganti Kata Sandi</TabsTrigger>
            </TabsList>
            
            {/* PROFILE TAB */}
            <TabsContent value="profile" className="space-y-6 mt-4">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex w-full h-full items-center justify-center text-slate-400 text-3xl font-bold">
                      {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadAvatar}
                    disabled={isUploading}
                  />
                  <Label 
                    htmlFor="avatar-upload" 
                    className="cursor-pointer flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md"
                  >
                    <Camera className="w-4 h-4" />
                    Ganti Foto
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email (Tidak dapat diubah)</Label>
                  <Input value={initialData.email} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomor HP</Label>
                  <Input 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="Contoh: 081234567890"
                  />
                </div>
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSavingProfile}
                  className="w-full"
                >
                  {isSavingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan Profil
                </Button>
              </div>
            </TabsContent>

            {/* PASSWORD TAB */}
            <TabsContent value="password" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Kata Sandi Baru</Label>
                <Input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div className="space-y-2">
                <Label>Konfirmasi Kata Sandi Baru</Label>
                <Input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Ketik ulang kata sandi baru"
                />
              </div>
              <Button 
                onClick={handleSavePassword} 
                disabled={isSavingPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {isSavingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Perbarui Kata Sandi
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
