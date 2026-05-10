
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Y3NvZXFxYmF5anJvZXRtc2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMDU3OTYsImV4cCI6MjA5Mzc4MTc5Nn0.pv5f9fqpScnNKlaWl7EPHz8j4bSTEDulBLS0YPFea0A';

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fixProduct() {
  const { data, error } = await supabase.from('produtos').upsert({
    id: 'k12',
    slug: 'her-code-body-splash',
    nome: 'Kit Her Code Body Splash',
    marca: 'O Boticário',
    descricao: 'Body splash refrescante em dupla para o dia a dia.',
    preco: 124.99,
    badge: null,
    imagem: '/src/assets/kits/her-code-body-splash.jpg',
    ativo: true
  });
  
  if (error) {
    console.error('Upsert error:', error.message);
  } else {
    console.log('Upsert success! Price updated to 124.99');
  }
}

fixProduct()
