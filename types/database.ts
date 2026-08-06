export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lembaga: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: 'super_admin' | 'media_admin' | 'lembaga_admin' | 'pimpinan'
          lembaga_id: string | null
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'super_admin' | 'media_admin' | 'lembaga_admin' | 'pimpinan'
          lembaga_id?: string | null
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'super_admin' | 'media_admin' | 'lembaga_admin' | 'pimpinan'
          lembaga_id?: string | null
          full_name?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'super_admin' | 'media_admin' | 'lembaga_admin' | 'pimpinan'
      submission_status: 'draft' | 'pending_review' | 'approved' | 'approved_with_notes' | 'rejected'
    }
  }
}
