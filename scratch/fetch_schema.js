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

const url = `${env.VITE_SUPABASE_URL}/rest/v1/`;
const key = env.VITE_SUPABASE_ANON_KEY;

async function fetchSchema() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const schema = await res.json();
    console.log("Schema paths:", Object.keys(schema.paths || {}));
  } catch (err) {
    console.error("Fetch schema error:", err);
  }
}

fetchSchema();
