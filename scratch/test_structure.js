import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStructure() {
  console.log("Calling signInWithPassword with dummy credentials...");
  const response = await supabase.auth.signInWithPassword({
    email: 'dummy@example.com',
    password: 'dummypassword'
  });
  console.log("Response keys:", Object.keys(response));
  console.log("Response.data keys:", response.data ? Object.keys(response.data) : 'null/undefined');
  console.log("Response.error:", response.error?.message);
}

testStructure();
