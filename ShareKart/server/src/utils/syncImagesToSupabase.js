import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

async function ensureBucket() {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: BUCKET_NAME,
        name: BUCKET_NAME,
        public: true
      })
    });
    if (res.ok) {
      console.log(`✅ Bucket "${BUCKET_NAME}" ensured in Supabase.`);
    }
  } catch (e) {
    // Ignore if already exists
  }
}

async function uploadAllImages() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    return;
  }

  await ensureBucket();

  if (!fs.existsSync(uploadsDir)) {
    console.error(`❌ Uploads directory not found at: ${uploadsDir}`);
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
  console.log(`🚀 Found ${files.length} images to sync to Supabase bucket "${BUCKET_NAME}"...`);

  let successCount = 0;

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const ext = path.extname(file).toLowerCase().replace('.', '');
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const fileBuffer = fs.readFileSync(filePath);

    try {
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${file}`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
          'Content-Type': mimeType,
          'x-upsert': 'true'
        },
        body: fileBuffer
      });

      if (res.ok) {
        successCount++;
        console.log(`[${successCount}/${files.length}] Uploaded: ${file}`);
      } else {
        const err = await res.text();
        console.warn(`Failed ${file}:`, err);
      }
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 Successfully synced ${successCount} images to Supabase!`);
  console.log(`Public URL format: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/<filename>`);
}

uploadAllImages();
