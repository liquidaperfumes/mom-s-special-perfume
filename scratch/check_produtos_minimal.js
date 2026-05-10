
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3NvZXFxYmF5anJvZXRtc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDU3OTYsImV4cCI6MjA5Mzc4MTc5Nn0.pv5f9fqpScnNKlaWl7EPHz8j4bSTEDulBLS0YPFea0A';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProdutos() {
  // Try to insert a minimal row to see what happens
  const { error } = await supabase.from('produtos').insert({ id: 'test-id' });
  if (error) {
    console.log('Error inserting minimal row:', error.message);
  } else {
    console.log('Minimal insert success!');
    await supabase.from('produtos').delete().eq('id', 'test-id');
  }
}

checkProdutos()
