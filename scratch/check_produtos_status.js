
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3NvZXFxYmF5anJvZXRtc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDU3OTYsImV4cCI6MjA5Mzc4MTc5Nn0.pv5f9fqpScnNKlaWl7EPHz8j4bSTEDulBLS0YPFea0A';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProdutosStatus() {
  const { data, error } = await supabase.from('produtos_status').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns in produtos_status:', data.length > 0 ? Object.keys(data[0]) : 'No rows');
    console.log('Data:', data);
  }
}

checkProdutosStatus()
