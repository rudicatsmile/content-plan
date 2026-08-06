import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import WebSocket from 'ws'

// @ts-ignore
global.WebSocket = WebSocket

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const DEFAULT_PASSWORD = 'password123'

const usersToCreate = [
  { email: 'superadmin@app.com', role: 'super_admin', name: 'Super Admin' },
  { email: 'mediaadmin@app.com', role: 'media_admin', name: 'Media Admin' },
  { email: 'pimpinan@app.com', role: 'pimpinan', name: 'Pimpinan Yayasan' },
  { email: 'tk@app.com', role: 'lembaga_admin', name: 'Admin TK', lembagaName: 'TK' },
  { email: 'sd@app.com', role: 'lembaga_admin', name: 'Admin SD', lembagaName: 'SD' },
  { email: 'smp@app.com', role: 'lembaga_admin', name: 'Admin SMP', lembagaName: 'SMP' },
  { email: 'smkdp1@app.com', role: 'lembaga_admin', name: 'Admin SMK DP1', lembagaName: 'SMK DP1' },
  { email: 'smkdp2@app.com', role: 'lembaga_admin', name: 'Admin SMK DP2', lembagaName: 'SMK DP2' },
]

async function seed() {
  console.log('Starting seed process...')

  for (const u of usersToCreate) {
    console.log(`\nProcessing user: ${u.email}...`)
    
    // 1. Create or get Lembaga if needed
    let lembagaId = null
    if (u.lembagaName) {
      const { data: lembagaData, error: lembagaError } = await supabase
        .from('lembaga')
        .select('id')
        .eq('name', u.lembagaName)
        .single()

      if (lembagaError && lembagaError.code !== 'PGRST116') { // PGRST116 is not found
        console.error('Error fetching lembaga:', lembagaError)
        continue
      }

      if (lembagaData) {
        lembagaId = lembagaData.id
      } else {
        const { data: newLembaga, error: newLembagaError } = await supabase
          .from('lembaga')
          .insert({ name: u.lembagaName })
          .select('id')
          .single()
        
        if (newLembagaError) {
          console.error('Error creating lembaga:', newLembagaError)
          continue
        }
        lembagaId = newLembaga.id
        console.log(`Created lembaga: ${u.lembagaName}`)
      }
    }

    // 2. Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`User ${u.email} already exists in auth. Skipping.`)
      } else {
        console.error(`Error creating auth user ${u.email}:`, authError)
      }
      continue
    }

    const userId = authData.user.id
    console.log(`Created auth user: ${u.email} (ID: ${userId})`)

    // 3. Upsert profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: u.email,
        full_name: u.name,
        role: u.role,
        lembaga_id: lembagaId,
      })

    if (profileError) {
      console.error(`Error creating profile for ${u.email}:`, profileError)
    } else {
      console.log(`Created/Updated profile for ${u.email} (Role: ${u.role})`)
    }
  }

  console.log('\nSeed process completed!')
}

seed().catch(console.error)
