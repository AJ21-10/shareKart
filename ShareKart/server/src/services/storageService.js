import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

let bucketChecked = false;

/**
 * Ensure the Supabase Storage bucket exists.
 * Attempts to auto-create it with public access if missing.
 */
async function ensureBucketExists() {
  if (bucketChecked || !SUPABASE_URL || !SUPABASE_KEY) return;
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
        public: true,
        file_size_limit: 10485760 // 10MB limit
      })
    });
    bucketChecked = true;
    if (res.ok) {
      console.log(`[Storage] Created Supabase bucket: ${BUCKET_NAME}`);
    }
  } catch (err) {
    console.warn('[Storage] Notice on bucket check:', err.message);
  }
}

/**
 * Fallback to saving image to local uploads directory
 */
function saveLocalFallback(buffer, ext, prefix = 'product') {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[Storage] Local fallback failed:', err);
    return null;
  }
}

/**
 * Uploads a base64 image (or URL) to Supabase Storage.
 * If Supabase is unreachable or not configured, falls back to local disk.
 * Returns the public URL string.
 */
export async function uploadImage(dataUrlOrUrl, prefix = 'product') {
  if (!dataUrlOrUrl || typeof dataUrlOrUrl !== 'string') return null;

  // If already a public web URL, keep it
  if (dataUrlOrUrl.startsWith('http://') || dataUrlOrUrl.startsWith('https://')) {
    return dataUrlOrUrl;
  }

  // Parse base64 data URL
  const matches = dataUrlOrUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!matches) {
    return dataUrlOrUrl;
  }

  const rawExt = matches[1].toLowerCase();
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt === 'svg+xml' ? 'svg' : rawExt;
  const mimeType = rawExt === 'jpg' || rawExt === 'jpeg' ? 'image/jpeg'
    : rawExt === 'png' ? 'image/png'
    : rawExt === 'webp' ? 'image/webp'
    : rawExt === 'gif' ? 'image/gif'
    : `image/${rawExt}`;
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;

  // Try Supabase Storage first if credentials exist
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      await ensureBucketExists();

      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filename}`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
          'Content-Type': mimeType,
          'x-upsert': 'true'
        },
        body: buffer
      });

      if (res.ok) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
        console.log(`[Storage] Uploaded image to Supabase: ${publicUrl}`);
        return publicUrl;
      } else {
        const errText = await res.text();
        console.warn(`[Storage] Supabase upload returned status ${res.status}: ${errText}. Falling back to local.`);
      }
    } catch (err) {
      console.warn('[Storage] Supabase upload failed, falling back to local:', err.message);
    }
  }

  // Fallback to local disk
  return saveLocalFallback(buffer, ext, prefix);
}

/**
 * Synchronous local save fallback (retained for backward compatibility)
 */
export const saveBase64Image = (dataUrl, prefix = 'product') => {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!matches) return null;
  const rawExt = matches[1].toLowerCase();
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt === 'svg+xml' ? 'svg' : rawExt;
  const buffer = Buffer.from(matches[2], 'base64');
  return saveLocalFallback(buffer, ext, prefix);
};

/**
 * Resolves an image path (such as /uploads/filename.jpg) to the public Supabase CDN URL
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/uploads/') && SUPABASE_URL) {
    const filename = url.replace(/^\/?uploads\//, '');
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
  }
  return url;
}

/**
 * Formats an array of product image paths to public URLs
 */
export function resolveProductImages(images) {
  if (!Array.isArray(images)) return [];
  return images.map(img => resolveImageUrl(img));
}
