
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3NvZXFxYmF5anJvZXRtc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDU3OTYsImV4cCI6MjA5Mzc4MTc5Nn0.pv5f9fqpScnNKlaWl7EPHz8j4bSTEDulBLS0YPFea0A';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkColumns() {
  // Try to select everything to see the keys of the first row (if any)
  // or just use an empty select to see if it errors out or gives hint
  // A better way is to try to select a known column and see what's returned
  const { data, error } = await supabase.from('produtos').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', data.length > 0 ? Object.keys(data[0]) : 'No rows to check');
  }
}

checkColumns()
