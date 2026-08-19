import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import WebSocket from 'ws'

// @ts-ignore
global.WebSocket = WebSocket

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createBucket() {
  console.log('Creating bucket "content-submissions"...')
  const { data, error } = await supabase.storage.createBucket('content-submissions', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  })
  
  if (error) {
    if (error.message.includes('already exists')) {
        console.log('Bucket already exists.')
    } else {
        console.error('Error creating bucket:', error)
    }
  } else {
    console.log('Bucket created successfully:', data)
  }
}

createBucket().catch(console.error)
