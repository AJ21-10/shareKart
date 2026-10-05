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
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString && !process.env.PGHOST) {
    console.error('❌ Error: No DATABASE_URL or PGHOST provided in .env');
    process.exit(1);
  }

  const pool = new Pool(
    connectionString
      ? {
          connectionString,
          ssl: process.env.PGSSL === 'true' || connectionString?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
        }
      : {
          user: process.env.PGUSER || 'postgres',
          host: process.env.PGHOST || 'localhost',
          database: process.env.PGDATABASE || 'sharekart_db',
          password: process.env.PGPASSWORD || 'postgres',
          port: Number(process.env.PGPORT) || 5432,
        }
  );

  console.log('Connecting to PostgreSQL database...');

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    // 1. Run schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    console.log(`Executing schema file: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema migration completed (All tables, constraints & indexes created)!');

    // 2. Run seed.sql
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    console.log(`Executing seed file: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('✅ Seed data successfully inserted (Users, Categories, Products, Rentals, Disputes, Reviews)!');

    client.release();
    await pool.end();
    console.log('🎉 PostgreSQL setup complete!');
  } catch (error) {
    console.error('❌ PostgreSQL Migration Error:', error.message);
    process.exit(1);
  }
}

runPostgresMigration();
