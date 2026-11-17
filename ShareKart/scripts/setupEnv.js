import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const serverEnvPath = path.join(rootDir, 'server', '.env');
const clientEnvPath = path.join(rootDir, 'client', '.env');

const SERVER_ENV_CONTENT = `PORT=5000
JWT_SECRET=sharekart_super_secret_jwt_key_2025

# =============================================================================
# PostgreSQL Database Configuration (Supabase)
# =============================================================================
DATABASE_URL=postgresql://postgres.xabnxhmgxtqvdfculcni:dXuHx0jAjhXknj1v@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
PGSSL=true

# =============================================================================
# Phone.Email Verification
# =============================================================================
API=ySvrQQdXWU6TQwMya4cj1L1q0TQARD7k
CLIENT_ID=11753610740663059476
PHONE_EMAIL_API_KEY=ySvrQQdXWU6TQwMya4cj1L1q0TQARD7k
PHONE_EMAIL_CLIENT_ID=11753610740663059476

# =============================================================================
# Supabase Configuration
# =============================================================================
SUPABASE_URL=https://xabnxhmgxtqvdfculcni.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYm54aG1neHRxdmRmY3VsY25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4ODExMjksImV4cCI6MjEwNzQ1NzEyOX0.WrQuiGoY2frNW2tQjDXXiVV5FqUx0AGiyNyYa-O1pug
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYm54aG1neHRxdmRmY3VsY25pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTg4MTEyOSwiZXhwIjoyMTA3NDU3MTI5fQ.OUWO9-XbkiDxdaPmQPzTE8LM1cHYEfKpymTRILGrcW0
SUPABASE_STORAGE_BUCKET=product-images
`;

const CLIENT_ENV_CONTENT = `# =============================================================================
# ShareKart Frontend (Vite) Environment Variables
# =============================================================================
VITE_API_BASE_URL=/api

# Phone.Email Configuration
VITE_PHONE_EMAIL_CLIENT_ID=11753610740663059476

# Supabase Configuration
VITE_SUPABASE_URL=https://xabnxhmgxtqvdfculcni.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYm54aG1neHRxdmRmY3VsY25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4ODExMjksImV4cCI6MjEwNzQ1NzEyOX0.WrQuiGoY2frNW2tQjDXXiVV5FqUx0AGiyNyYa-O1pug
`;

function setup() {
  console.log('⚡ Setting up ShareKart Environment Files (.env)...');

  fs.writeFileSync(serverEnvPath, SERVER_ENV_CONTENT, 'utf8');
  console.log(`✅ Server .env generated at: ${serverEnvPath}`);

  fs.writeFileSync(clientEnvPath, CLIENT_ENV_CONTENT, 'utf8');
  console.log(`✅ Client .env generated at: ${clientEnvPath}`);

  console.log('\n🎉 Done! Server and Client are now 100% configured with Supabase.');
  console.log('You can now run: npm run dev:server & npm run dev:client');
}

setup();
