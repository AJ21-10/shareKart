import pg from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection configuration
const connectionString = process.env.DATABASE_URL;
const useSsl = process.env.PGSSL === 'true' || connectionString?.includes('sslmode=require');

let pool = null;
let sqliteDb = null;
let activeClient = 'postgres'; // 'postgres' or 'sqlite'

if (connectionString || process.env.PGHOST) {
  const poolConfig = connectionString
    ? {
        connectionString,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 3000,
      }
    : {
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'sharekart_db',
        password: process.env.PGPASSWORD || 'postgres',
        port: Number(process.env.PGPORT) || 5432,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 3000,
      };

  pool = new Pool(poolConfig);

  // Monitor pool errors
  pool.on('error', (err) => {
    console.error('[PostgreSQL] Unexpected pool client error:', err.message);
  });
}

// Helper to convert SQLite '?' placeholders to PostgreSQL '$1, $2, ...'
function formatPgQuery(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// Fallback SQLite initialization
function getSqliteDb() {
  if (!sqliteDb) {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'sharekart.sqlite');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
  }
  return sqliteDb;
}

// Unified Database Adapter
const db = {
  get clientType() {
    return activeClient;
  },

  get pool() {
    return pool;
  },

  /**
   * Execute raw query with parameters
   */
  async query(sqlText, params = []) {
    if (activeClient === 'postgres' && pool) {
      try {
        const pgSql = formatPgQuery(sqlText);
        return await pool.query(pgSql, params);
      } catch (err) {
        // If Postgres connection refused and haven't tried fallback yet
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === '28P01') {
          console.warn(`[Database] PostgreSQL error (${err.message}). Falling back to SQLite...`);
          activeClient = 'sqlite';
          return this.query(sqlText, params);
        }
        throw err;
      }
    } else {
      const sqlite = getSqliteDb();
      const trimmed = sqlText.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
        const rows = sqlite.prepare(sqlText).all(...params);
        return { rows, rowCount: rows.length };
      } else {
        const res = sqlite.prepare(sqlText).run(...params);
        return { rows: [], rowCount: res.changes, lastInsertRowid: res.lastInsertRowid };
      }
    }
  },

  /**
   * Fetch single row
   */
  async get(sqlText, params = []) {
    if (activeClient === 'postgres' && pool) {
      try {
        const pgSql = formatPgQuery(sqlText);
        const res = await pool.query(pgSql, params);
        return res.rows[0] || null;
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === '28P01') {
          console.warn(`[Database] PostgreSQL error (${err.message}). Falling back to SQLite...`);
          activeClient = 'sqlite';
          return this.get(sqlText, params);
        }
        throw err;
      }
    } else {
      const sqlite = getSqliteDb();
      return sqlite.prepare(sqlText).get(...params) || null;
    }
  },

  /**
   * Fetch all matching rows
   */
  async all(sqlText, params = []) {
    if (activeClient === 'postgres' && pool) {
      try {
        const pgSql = formatPgQuery(sqlText);
        const res = await pool.query(pgSql, params);
        return res.rows;
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === '28P01') {
          console.warn(`[Database] PostgreSQL error (${err.message}). Falling back to SQLite...`);
          activeClient = 'sqlite';
          return this.all(sqlText, params);
        }
        throw err;
      }
    } else {
      const sqlite = getSqliteDb();
      return sqlite.prepare(sqlText).all(...params);
    }
  },

  /**
   * Execute INSERT, UPDATE, DELETE
   */
  async run(sqlText, params = []) {
    if (activeClient === 'postgres' && pool) {
      try {
        let pgSql = sqlText.trim();
        // Automatically append RETURNING id for INSERT statements if not present
        if (pgSql.toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING')) {
          pgSql += ' RETURNING id';
        }
        pgSql = formatPgQuery(pgSql);
        const res = await pool.query(pgSql, params);
        return {
          changes: res.rowCount,
          lastInsertRowid: res.rows[0]?.id || null,
          rows: res.rows,
        };
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === '28P01') {
          console.warn(`[Database] PostgreSQL error (${err.message}). Falling back to SQLite...`);
          activeClient = 'sqlite';
          return this.run(sqlText, params);
        }
        throw err;
      }
    } else {
      const sqlite = getSqliteDb();
      const res = sqlite.prepare(sqlText).run(...params);
      return {
        changes: res.changes,
        lastInsertRowid: res.lastInsertRowid,
        rows: [],
      };
    }
  },

  /**
   * Test database connectivity
   */
  async testConnection() {
    if (pool) {
      try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
        client.release();
        console.log(`[Database] ✅ Connected to PostgreSQL database: "${res.rows[0].db_name}" at ${res.rows[0].current_time}`);
        activeClient = 'postgres';
        return true;
      } catch (err) {
        console.warn(`[Database] ⚠️  PostgreSQL is not reachable (${err.message}). Using local SQLite fallback for seamless development.`);
        activeClient = 'sqlite';
        return false;
      }
    } else {
      activeClient = 'sqlite';
      console.log('[Database] Using SQLite database.');
      return false;
    }
  }
};

// Check connection on server boot
db.testConnection().catch(() => {});

export default db;
