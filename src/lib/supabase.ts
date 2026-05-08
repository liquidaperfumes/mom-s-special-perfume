import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uycsoeqqbayjroetmsai.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ETTf_ZK_wPZnYck2p9Nkwg_Ua4ugunJ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
