# Task Breakdown — Aplikasi Pengajuan & Approval Konten Berjenjang

**Referensi:** PRD-Aplikasi-Konten-Berjenjang.md
**Format:** Siap dipecah menjadi Issue/Ticket (GitHub Issues, Linear, Jira, dll)
**Estimasi total:** ± 7–8 minggu (1 developer full-time) / lebih cepat jika paralel

> Checklist `[ ]` bisa langsung dipakai sebagai task tracker. Setiap task memiliki kode unik (mis. `F0-01`) untuk referensi commit/PR.

---

## Legenda Prioritas & Label

| Label | Arti |
|---|---|
| `P0` | Blocker — harus selesai sebelum fase lanjut |
| `P1` | Penting, tidak blocking |
| `P2` | Nice-to-have / bisa ditunda ke fase berikutnya |

---

## FASE 0 — Setup & Fondasi (± 1 minggu)

**Tujuan:** project berjalan, auth bekerja, skema DB & RLS dasar aktif, siap dipakai fase berikutnya.

### 0.1 Project Setup
- [ ] `F0-01` `P0` Inisialisasi project Next.js 15 (App Router, TypeScript strict) via `create-next-app`
- [ ] `F0-02` `P0` Setup Tailwind CSS + install & konfigurasi `shadcn/ui` (theme, `components.json`)
- [ ] `F0-03` `P0` Setup ESLint + Prettier + Husky pre-commit (lint & type-check)
- [ ] `F0-04` `P1` Setup struktur folder: `app/`, `components/`, `lib/`, `hooks/`, `stores/`, `types/`, `server-actions/`
- [ ] `F0-05` `P0` Setup repo Git + branching strategy (`main`, `develop`, `feature/*`)
- [ ] `F0-06` `P0` Konfigurasi environment variables (`.env.local`, `.env.example`) untuk Supabase URL & anon key

### 0.2 Supabase Setup
- [ ] `F0-07` `P0` Buat project Supabase (dev/staging) + project terpisah untuk production
- [ ] `F0-08` `P0` Buat skema database sesuai PRD §7 (tabel: `lembaga`, `profiles`, `social_platforms`, `content_submissions`, `content_submission_platforms`, `submission_reviews`, `notifications`)
- [ ] `F0-09` `P0` Buat migration file terversion (`supabase/migrations/`) — jangan buat tabel manual via dashboard
- [ ] `F0-10` `P0` Setup index sesuai rekomendasi PRD
- [ ] `F0-11` `P0` Aktifkan RLS di semua tabel + tulis policy dasar (per role)
- [ ] `F0-12` `P0` Seed data awal: 5 lembaga (TK, SD, SMP, SMK DP1, SMK DP2), platform sosmed default (YouTube, Instagram, Facebook, Telegram, TikTok)
- [ ] `F0-13` `P0` Generate TypeScript types dari Supabase (`supabase gen types typescript`) → `types/database.ts`
- [ ] `F0-14` `P1` Setup Supabase Storage bucket `content-submissions` + storage policy per role

### 0.3 Autentikasi & Otorisasi
- [ ] `F0-15` `P0` Setup `@supabase/ssr` untuk client (browser) & server (server component/action)
- [ ] `F0-16` `P0` Halaman `/login` (email + password)
- [ ] `F0-17` `P0` Middleware `middleware.ts` — proteksi route berdasarkan session
- [ ] `F0-18` `P0` Logic redirect berdasarkan role setelah login (`/dashboard`)
- [ ] `F0-19` `P1` Halaman 403 (Unauthorized) & 404 custom
- [ ] `F0-20` `P2` Fitur "lupa password" (Supabase reset password flow)

### 0.4 State Management Boilerplate
- [ ] `F0-21` `P0` Setup TanStack Query Provider (`QueryClientProvider`) di root layout
- [ ] `F0-22` `P0` Setup Zustand store dasar: `useUIStore` (dialog state, sidebar, filter kalender)
- [ ] `F0-23` `P1` Setup React Query DevTools (khusus dev environment)

**✅ Exit Criteria Fase 0:** User bisa login, ter-redirect sesuai role, koneksi ke Supabase berjalan, tipe data ter-generate, RLS aktif dan teruji minimal via manual test (login sebagai 2 role berbeda, cek akses data).

---

## FASE 1 — Modul Pengajuan Konten (± 1.5–2 minggu)

**Tujuan:** Admin Lembaga bisa membuat, menyimpan draft, submit, melihat, dan membatalkan pengajuan.

### 1.1 Data Layer
- [ ] `F1-01` `P0` Server Action: `createSubmission(data)` — insert `content_submissions` + relasi `content_submission_platforms`
- [ ] `F1-02` `P0` Server Action: `updateSubmission(id, data)` — hanya untuk status `draft`
- [ ] `F1-03` `P0` Server Action: `submitSubmission(id)` — ubah status `draft` → `pending_review`, set `submitted_at`
- [ ] `F1-04` `P0` Server Action: `cancelSubmission(id)` — hanya untuk status `draft`/`pending_review`
- [ ] `F1-05` `P1` Server Action: `duplicateAsRevision(id)` — untuk "Ajukan Ulang" dari status `rejected`
- [ ] `F1-06` `P0` React Query hooks: `useSubmissions(filters)`, `useSubmission(id)`, mutation hooks untuk semua action di atas

### 1.2 Upload Gambar
- [ ] `F1-07` `P0` Komponen upload gambar dengan preview (drag & drop + klik)
- [ ] `F1-08` `P0` Validasi client: tipe file (jpg/png/webp), ukuran max 5MB
- [ ] `F1-09` `P1` Kompresi gambar di client sebelum upload (`browser-image-compression`)
- [ ] `F1-10` `P0` Upload ke Supabase Storage bucket `content-submissions`, path terstruktur (`{lembaga_id}/{submission_id}/{filename}`)

### 1.3 Form Pengajuan
- [ ] `F1-11` `P0` Skema validasi Zod: judul (wajib, max 150), keterangan (opsional, max 1000), tanggal_upload (wajib), platform (min 1), image (wajib)
- [ ] `F1-12` `P0` Form dengan React Hook Form + shadcn form components (`Input`, `Textarea`, `DatePicker`, `MultiSelect`/checkbox group platform)
- [ ] `F1-13` `P0` Halaman `/pengajuan/baru` — form buat pengajuan baru
- [ ] `F1-14` `P0` Tombol "Simpan sebagai Draft" vs "Ajukan Sekarang"
- [ ] `F1-15` `P1` Autosave draft (opsional, debounce saat user mengetik)

### 1.4 List & Detail
- [ ] `F1-16` `P0` Halaman `/pengajuan` — list/table pengajuan milik lembaga (filter status, sort tanggal)
- [ ] `F1-17` `P0` Halaman `/pengajuan/[id]` — detail pengajuan (gambar, semua field, status badge, riwayat review jika ada)
- [ ] `F1-18` `P0` Tombol aksi kontekstual sesuai status (Edit, Ajukan, Batalkan, Ajukan Ulang)
- [ ] `F1-19` `P1` Empty state & skeleton loading

**✅ Exit Criteria Fase 1:** Admin lembaga dapat membuat pengajuan lengkap dengan gambar, menyimpan draft, mengajukan, melihat daftar & detail, dan membatalkan pengajuan miliknya sendiri (dan hanya miliknya — verifikasi RLS).

---

## FASE 2 — Modul Review Admin Media (± 1 minggu)

**Tujuan:** Admin Media dapat melihat antrian, mereview, dan mengambil keputusan dengan audit trail.

### 2.1 Data Layer
- [ ] `F2-01` `P0` Server Action: `reviewSubmission(id, decision, notes)` — validasi: `notes` wajib jika decision `rejected`/`approved_with_notes`
- [ ] `F2-02` `P0` Insert baris ke `submission_reviews` setiap kali keputusan diambil (idempotent, tidak overwrite histori)
- [ ] `F2-03` `P0` Update `content_submissions.status` sesuai decision dalam satu transaksi dengan insert review
- [ ] `F2-04` `P0` RLS: pastikan hanya `media_admin`/`super_admin` yang bisa memanggil action ini (double-check di server, bukan hanya UI)
- [ ] `F2-05` `P0` React Query hooks: `usePendingSubmissions()`, `useReviewMutation()`

### 2.2 UI Review
- [ ] `F2-06` `P0` Halaman `/review` — antrian pengajuan `pending_review`, sort by `tanggal_upload` terdekat
- [ ] `F2-07` `P0` Filter: lembaga, platform, rentang tanggal
- [ ] `F2-08` `P0` Halaman/dialog `/review/[id]` — detail pengajuan + form keputusan (radio: Diterima / Diterima dengan Catatan / Ditolak + textarea catatan kondisional wajib)
- [ ] `F2-09` `P0` Konfirmasi sebelum submit keputusan (dialog konfirmasi, terutama untuk Ditolak)
- [ ] `F2-10` `P1` Riwayat review ditampilkan sebagai timeline di halaman detail pengajuan (untuk semua role terkait)
- [ ] `F2-11` `P1` Bulk view: badge jumlah pending di sidebar/menu Admin Media

**✅ Exit Criteria Fase 2:** Admin Media dapat melihat semua pengajuan pending lintas lembaga, memutuskan dengan catatan wajib sesuai aturan, dan histori keputusan tersimpan permanen dan terlihat oleh lembaga terkait.

---

## FASE 3 — Modul Notifikasi (± 1 minggu)

**Tujuan:** Notifikasi in-app real-time terkirim ke pihak terkait setiap ada keputusan.

### 3.1 Data Layer
- [ ] `F3-01` `P0` Extend `reviewSubmission` action: setelah update status, insert baris `notifications` untuk (a) pembuat pengajuan, (b) semua user role `pimpinan`
- [ ] `F3-02` `P0` Server Action: `markNotificationRead(id)` dan `markAllRead()`
- [ ] `F3-03` `P0` React Query hook: `useNotifications()`, dengan `refetchOnWindowFocus`

### 3.2 Realtime
- [ ] `F3-04` `P0` Setup Supabase Realtime channel subscribe ke tabel `notifications` (filter `recipient_id = auth.uid()`)
- [ ] `F3-05` `P0` Saat event realtime masuk → invalidate/update React Query cache untuk `notifications` & badge count
- [ ] `F3-06` `P1` Setup realtime subscribe juga ke `content_submissions` untuk update kalender otomatis (lihat Fase 4)

### 3.3 UI Notifikasi
- [ ] `F3-07` `P0` Komponen bell icon + badge unread count di navbar
- [ ] `F3-08` `P0` Dropdown/panel notifikasi (shadcn `Popover`/`Sheet`) — list 10 terbaru, link ke pengajuan terkait
- [ ] `F3-09` `P1` Halaman `/notifikasi` — daftar lengkap dengan pagination
- [ ] `F3-10` `P0` Toast (shadcn `Sonner`) muncul saat notifikasi baru diterima secara realtime
- [ ] `F3-11` `P2` Notifikasi email via Supabase Edge Function + provider (Resend/SendGrid) — **out of MVP, siapkan hook saja**

**✅ Exit Criteria Fase 3:** Setiap kali Admin Media mengambil keputusan, lembaga pengaju & seluruh Pimpinan menerima notifikasi in-app tanpa refresh manual, badge unread akurat.

---

## FASE 4 — Dashboard Kalender (± 1.5–2 minggu)

**Tujuan:** Kalender gaya Google Calendar dengan pewarnaan status, filter, dan interaksi detail.

### 4.1 Setup Library
- [ ] `F4-01` `P0` Install & konfigurasi `@fullcalendar/react` + plugin (`dayGrid`, `timeGrid`, `list`, `interaction`)
- [ ] `F4-02` `P0` Kustomisasi styling FullCalendar agar sesuai tema Tailwind/shadcn (override CSS variables)

### 4.2 Data Layer
- [ ] `F4-03` `P0` Server function/RPC: `getSubmissionsByDateRange(start, end, filters)` — query hanya rentang bulan yang tampil (hindari fetch semua data)
- [ ] `F4-04` `P0` React Query hook: `useCalendarEvents({ start, end, lembagaIds, platformIds })`, `queryKey` menyertakan semua filter
- [ ] `F4-05` `P0` Mapping data `content_submissions` → format event FullCalendar (title, date, color berdasarkan status, extendedProps)

### 4.3 UI Kalender
- [ ] `F4-06` `P0` Halaman `/dashboard` — layout: sidebar kiri (mini calendar, filter lembaga, filter platform, legenda warna) + area kalender utama
- [ ] `F4-07` `P0` Toggle view: Month / Week / Agenda
- [ ] `F4-08` `P0` Render event dengan dot/chip warna sesuai status (skema warna PRD §4.4.1) + thumbnail kecil jika memungkinkan
- [ ] `F4-09` `P0` Klik event → buka Sheet/Dialog detail pengajuan (reuse komponen dari Fase 1/2)
- [ ] `F4-10` `P0` Filter lembaga: checkbox multi-select (mirip "my calendars"), state disimpan di Zustand (`useCalendarFilterStore`) — hanya tampil untuk role `media_admin`/`pimpinan`
- [ ] `F4-11` `P0` Filter platform sosmed
- [ ] `F4-12` `P0` Legenda warna status selalu terlihat (sidebar/header)
- [ ] `F4-13` `P0` Lembaga role: kalender otomatis ter-filter hanya lembaganya sendiri (tanpa opsi filter lembaga lain)
- [ ] `F4-14` `P0` FAB "+ Ajukan Konten" (khusus role `lembaga_admin`) yang membuka form Fase 1
- [ ] `F4-15` `P1` Tanggal tanpa pengajuan tidak menampilkan indikator apa pun (verifikasi visual)
- [ ] `F4-16` `P1` Realtime update kalender saat ada pengajuan baru/berubah status (pakai subscribe dari `F3-06`)
- [ ] `F4-17` `P2` Export kalender ke iCal/PDF (opsional, fase lanjutan)

**✅ Exit Criteria Fase 4:** Kalender menampilkan semua pengajuan pada tanggal rencana upload dengan warna sesuai status; filter lembaga & platform berfungsi; klik event membuka detail; role lembaga hanya melihat datanya sendiri.

---

## FASE 5 — PWA & Responsive Polish (± 1 minggu)

**Tujuan:** Aplikasi installable, punya offline shell dasar, dan nyaman dipakai di HP.

### 5.1 PWA Setup
- [ ] `F5-01` `P0` Install & konfigurasi `@ducanh2912/next-pwa` (atau Serwist)
- [ ] `F5-02` `P0` Buat `manifest.json` (nama app, icon, theme color, display: standalone)
- [ ] `F5-03` `P0` Siapkan icon set (192x192, 512x512, maskable icon)
- [ ] `F5-04` `P0` Konfigurasi service worker caching strategy: cache-first untuk asset statis (JS/CSS/font/icon), network-first (fallback cache) untuk data (kalender, list pengajuan)
- [ ] `F5-05` `P1` Halaman offline fallback sederhana
- [ ] `F5-06` `P1` Install prompt UI kustom ("Tambahkan ke Layar Utama")
- [ ] `F5-07` `P2` Web Push notification setup (opsional, lanjutan dari Fase 3)

### 5.2 Responsive & Aksesibilitas
- [ ] `F5-08` `P0` Audit semua halaman utama di breakpoint mobile (form pengajuan, kalender, review, notifikasi)
- [ ] `F5-09` `P0` Kalender view mobile: default ke "Agenda/List view" agar lebih mudah dibaca di layar kecil
- [ ] `F5-10` `P1` Uji navigasi keyboard & kontras warna (a11y dasar) khususnya untuk badge status
- [ ] `F5-11` `P1` Optimasi loading gambar (Next.js `<Image>`, lazy loading di list/kalender)

**✅ Exit Criteria Fase 5:** Lighthouse PWA score baik (installable, service worker aktif), aplikasi tetap bisa dibuka & menampilkan data ter-cache saat offline sementara, seluruh halaman utama nyaman digunakan di mobile.

---

## FASE 6 — QA, UAT & Deployment (± 1 minggu)

**Tujuan:** Aplikasi teruji, disetujui pengguna kunci, dan live di production.

### 6.1 Testing
- [ ] `F6-01` `P0` Unit test untuk Server Actions kritikal (create/submit/review submission) — pastikan validasi & state machine status benar
- [ ] `F6-02` `P0` Test RLS: skenario lintas-role mencoba akses data yang bukan haknya (harus ditolak)
- [ ] `F6-03` `P1` E2E test (Playwright) untuk alur utama: login → buat pengajuan → submit → review → notifikasi muncul → tampil di kalender
- [ ] `F6-04` `P1` Test performa kalender dengan data dummy volume tinggi (ratusan pengajuan/bulan)

### 6.2 UAT
- [ ] `F6-05` `P0` Siapkan environment staging dengan data dummy realistis (5 lembaga, beberapa pengajuan tiap status)
- [ ] `F6-06` `P0` Sesi UAT bersama Kepala Bagian Media / Kasubbag Media
- [ ] `F6-07` `P0` Sesi UAT bersama 1 perwakilan tiap lembaga (uji form pengajuan)
- [ ] `F6-08` `P0` Sesi UAT bersama Pimpinan Yayasan (uji dashboard read-only)
- [ ] `F6-09` `P0` Kumpulkan feedback, prioritaskan perbaikan (P0 bug wajib fix sebelum go-live)

### 6.3 Deployment
- [ ] `F6-10` `P0` Setup project Vercel (production) terhubung ke branch `main`
- [ ] `F6-11` `P0` Setup environment variables production (Supabase production project)
- [ ] `F6-12` `P0` Migrasi skema DB ke Supabase production + seed data master (lembaga, platform)
- [ ] `F6-13` `P0` Buat akun awal: 1 super_admin, 1 media_admin, akun lembaga_admin untuk 5 lembaga, akun pimpinan
- [ ] `F6-14` `P1` Setup monitoring dasar (Vercel Analytics, Supabase logs)
- [ ] `F6-15` `P1` Buat dokumentasi singkat penggunaan (user guide) per role
- [ ] `F6-16` `P0` Go-live & serah terima

**✅ Exit Criteria Fase 6:** Aplikasi live di production, seluruh acceptance criteria PRD terpenuhi, pengguna kunci sudah dilatih/paham cara pakai.

---

## Ringkasan Dependensi Antar Fase

```
Fase 0 (Setup & Auth)
   └──> Fase 1 (Pengajuan) ──┐
   └──> Fase 2 (Review) ─────┼──> Fase 3 (Notifikasi) ──> Fase 4 (Kalender) ──> Fase 5 (PWA) ──> Fase 6 (QA/Deploy)
```

- Fase 1 & 2 bisa dikerjakan semi-paralel setelah Fase 0 selesai (Fase 2 butuh minimal data pengajuan dari Fase 1 untuk diuji).
- Fase 3 bergantung pada state-change dari Fase 2.
- Fase 4 bisa mulai dikerjakan (setup FullCalendar) paralel dengan Fase 3, tapi butuh data submission dari Fase 1 untuk isi kalender.
- Fase 5 & 6 murni setelah fitur inti (0–4) selesai.

---

*Dokumen ini adalah turunan langsung dari PRD-Aplikasi-Konten-Berjenjang.md. Setiap task dapat dipindahkan langsung sebagai Issue di GitHub/Linear/Jira dengan kode task sebagai referensi (mis. `F1-07`).*
