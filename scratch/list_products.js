
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3NvZXFxYmF5anJvZXRtc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDU3OTYsImV4cCI6MjA5Mzc4MTc5Nn0.pv5f9fqpScnNKlaWl7EPHz8j4bSTEDulBLS0YPFea0A';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listProducts() {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
  
  if (error) {
    console.error('Error fetching products:', error)
  } else {
    console.log('Products in DB:', JSON.stringify(data, null, 2))
  }
}

listProducts()
