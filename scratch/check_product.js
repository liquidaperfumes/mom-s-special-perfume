
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkProduct() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', 'k12')
  
  if (error) {
    console.error('Error fetching product:', error)
  } else {
    console.log('Product data:', data)
  }
}

checkProduct()
