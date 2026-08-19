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

const platforms = [
  { name: 'Instagram', icon_url: 'instagram' },
  { name: 'Facebook', icon_url: 'facebook' },
  { name: 'TikTok', icon_url: 'tiktok' },
  { name: 'Twitter / X', icon_url: 'twitter' },
  { name: 'YouTube', icon_url: 'youtube' },
  { name: 'Website', icon_url: 'website' }
]

async function seedPlatforms() {
  console.log('Seeding social platforms...')
  
  for (const p of platforms) {
    const { data: existing } = await supabase
      .from('social_platforms')
      .select('id')
      .eq('name', p.name)
      .single()
      
    if (!existing) {
      const { error } = await supabase.from('social_platforms').insert(p)
      if (error) {
        console.error(`Error inserting ${p.name}:`, error)
      } else {
        console.log(`Inserted ${p.name}`)
      }
    } else {
      console.log(`${p.name} already exists.`)
    }
  }
  console.log('Finished seeding platforms!')
}

seedPlatforms().catch(console.error)
