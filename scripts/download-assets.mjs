import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public');

const assets = [
  'https://assets.niche.com/static/home/hero-lg.webp',
  'https://assets.niche.com/static/direct-admissions-logo.webp',
  'https://assets.niche.com/static/app-cta/Get_it_on_Google_play.png',
  'https://assets.niche.com/static/home/logo-phillips-andover.png',
  'https://assets.niche.com/static/home/logo-oregon.png',
  'https://assets.niche.com/static/home/logo-wash-jeff.png',
  'https://assets.niche.com/static/home/logo-marquette.png',
  'https://assets.niche.com/static/home/start-student-with-dog.webp',
  'https://assets.niche.com/static/home/noise.png',
  'https://assets.niche.com/static/home/abby-1.webp',
  'https://assets.niche.com/static/home/abby-2.webp',
  'https://assets.niche.com/static/home/dayna-1.webp',
  'https://assets.niche.com/static/home/dayna-2.webp',
  'https://assets.niche.com/static/home/clay-1.webp',
  'https://assets.niche.com/static/home/clay-2.webp',
  'https://assets.niche.com/static/home/abby-swoosh-desktop.png',
  'https://assets.niche.com/static/home/dayna-swoosh-desktop.png',
  'https://assets.niche.com/static/home/clay-swoosh-desktop.png',
  'https://assets.niche.com/static/ranking-badges/colleges-salt-badge.svg',
  'https://assets.niche.com/static/ranking-badges/k12-salt-badge.svg',
  'https://assets.niche.com/static/Niche-N-Green-900.svg',
  'https://assets.niche.com/static/social-icons/instagram.svg',
  'https://assets.niche.com/static/social-icons/facebook.svg',
  'https://assets.niche.com/static/social-icons/X.svg',
  'https://assets.niche.com/static/social-icons/tiktok.svg',
  'https://assets.niche.com/static/social-icons/youtube.svg',
  'https://assets.niche.com/static/home/why-icon-1.svg',
  'https://assets.niche.com/static/home/why-icon-2.svg',
  'https://assets.niche.com/static/home/why-icon-3.svg',
  'https://assets.niche.com/static/home/stamp-claim.svg',
  'https://assets.niche.com/static/home/stamp-found.svg',
  'https://assets.niche.com/static/home/stamp-dayna.svg',
  'https://assets.niche.com/static/home/stamp-clay.svg',
  'https://assets.niche.com/static/home/stamp-everything.svg'
];

async function download(url) {
  const filename = path.basename(new URL(url).pathname);
  const dir = path.dirname(new URL(url).pathname).replace(/^\/static/, '');
  const targetDir = path.join(PUBLIC_DIR, dir);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetPath = path.join(targetDir, filename);
  console.log(`Downloading ${url} to ${targetPath}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(targetPath, buffer);
  } catch (err) {
    console.error(`Failed to download ${url}:`, err.message);
  }
}

async function main() {
  for (const url of assets) {
    await download(url);
  }
  console.log('All downloads complete!');
}

main();
