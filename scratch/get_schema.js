
const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3NvZXFxYmF5anJvZXRtc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDU3OTYsImV4cCI6MjA5Mzc4MTc5Nn0.pv5f9fqpScnNKlaWl7EPHz8j4bSTEDulBLS0YPFea0A';

async function getSchema() {
  const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`, {
    headers: {
      'Accept': 'application/openapi+json'
    }
  });
  const schema = await response.json();
  console.log('Schema for produtos:', JSON.stringify(schema.definitions.produtos, null, 2));
}

getSchema()
