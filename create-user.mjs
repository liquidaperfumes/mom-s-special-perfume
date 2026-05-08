import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = 'sb_publishable_ETTf_ZK_wPZnYck2p9Nkwg_Ua4ugunJ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function criarUsuario() {
  console.log("Tentando criar usuário via API...");
  const { data, error } = await supabase.auth.signUp({
    email: 'marketing@liquidaperfumes.com',
    password: 'liquida2026',
  });

  if (error) {
    console.error("ERRO AO CRIAR USUARIO:", error.message);
  } else {
    console.log("SUCESSO! Usuário criado:", data.user?.email);
    console.log("O usuário precisará confirmar o email se a confirmação estiver ativada.");
  }
}

criarUsuario();
