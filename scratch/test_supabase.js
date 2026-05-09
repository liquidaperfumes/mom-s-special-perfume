
import { createClient } from '@supabase/supabase-js';

const url = "https://tctxqltzvoiirftyzzjk.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdHhxbHR6dm9paXJmdHl6emprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTUwNzEsImV4cCI6MjA5Mzc3MTA3MX0.u8EE-QNIGMegp6x4xvzkYAklJrFudSL0s2ghHMNiMbc";

console.log("Checking Supabase connection...");
console.log("URL:", url);

const supabase = createClient(url, key);

async function test() {
  try {
    const { data, error } = await supabase.from('pedidos').select('*').limit(1);
    if (error) {
      console.error("Connection failed:", error);
    } else {
      console.log("Connection successful! Data:", data);
    }
  } catch (e) {
    console.error("Crash:", e);
  }
}

test();
