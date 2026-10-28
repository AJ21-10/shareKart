import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPostgresMigration() {
  const rawConnectionString = process.env.DATABASE_URL;
  if (!rawConnectionString && !process.env.PGHOST) {
    console.error('❌ Error: No DATABASE_URL or PGHOST provided in .env');
    process.exit(1);
  }

  const useSsl =
    process.env.PGSSL === 'true' ||
    rawConnectionString?.includes('sslmode=require') ||
    rawConnectionString?.includes('supabase.co') ||
    rawConnectionString?.includes('supabase.com');

  const connectionString = rawConnectionString?.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?$/, '');

  const pool = new Pool(
    connectionString
      ? {
          connectionString,
          ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        }
      : {
          user: process.env.PGUSER || 'postgres',
          host: process.env.PGHOST || 'localhost',
          database: process.env.PGDATABASE || 'sharekart_db',
          password: process.env.PGPASSWORD || 'postgres',
          port: Number(process.env.PGPORT) || 5432,
          ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        }
  );

  //this is comment

  console.log('Connecting to PostgreSQL database...');

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully to PostgreSQL!');

    // 1. Run schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    console.log(`Executing schema file: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ PostgreSQL Schema migration completed (All tables, constraints & indexes created)!');

    // 2. Run seed.sql
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    console.log(`Executing seed file: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('✅ PostgreSQL Seed data successfully inserted (Users, Categories, Products, Rentals, Disputes, Reviews)!');

    client.release();
    await pool.end();
    console.log('🎉 PostgreSQL setup complete!');
  } catch (error) {
    console.error('❌ PostgreSQL Migration Error:', error.message);
    process.exit(1);
  }
}

runPostgresMigration();
