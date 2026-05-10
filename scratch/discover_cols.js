
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3NvZXFxYmF5anJvZXRtc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDU3OTYsImV4cCI6MjA5Mzc4MTc5Nn0.pv5f9fqpScnNKlaWl7EPHz8j4bSTEDulBLS0YPFea0A';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function discoverColumns() {
  // PostgREST error messages often list available columns when a non-existent one is queried
  // but only if the error is specific enough.
  // Another way: select a column that definitely doesn't exist and see the error.
  const { error } = await supabase.from('produtos').select('non_existent_column_for_discovery').limit(1);
  if (error) {
    console.log('Error message:', error.message);
  }
}

discoverColumns()
