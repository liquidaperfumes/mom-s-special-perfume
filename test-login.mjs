import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'sb_publishable_ETTf_ZK_wPZnYck2p9Nkwg_Ua4ugunJ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarLogin() {
  console.log("Tentando logar...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'marketing@liquidaperfumes.com',
    password: 'liquida2026',
  });

  if (error) {
    console.error("ERRO AO LOGAR:", error.message);
  } else {
    console.log("SUCESSO! Logado como:", data.user?.email);
  }
}

testarLogin();
