import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection configuration
const connectionString = process.env.DATABASE_URL;
const useSsl = process.env.PGSSL === 'true' || connectionString?.includes('sslmode=require');

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
    }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'sharekart_db',
      password: process.env.PGPASSWORD || 'postgres',
      port: Number(process.env.PGPORT) || 5432,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000,
    };

export const pool = new Pool(poolConfig);

// Monitor pool errors
pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected pool client error:', err.message);
});

// Helper to convert '?' placeholders to PostgreSQL '$1, $2, ...'
export function formatPgQuery(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// PostgreSQL Database Client Interface
const db = {
  clientType: 'postgres',
  pool,

  /**
   * Execute raw query with parameters
   */
  async query(sqlText, params = []) {
    const pgSql = formatPgQuery(sqlText);
    return await pool.query(pgSql, params);
  },

  /**
   * Fetch single row
   */
  async get(sqlText, params = []) {
    const pgSql = formatPgQuery(sqlText);
    const res = await pool.query(pgSql, params);
    return res.rows[0] || null;
  },

  /**
   * Fetch all matching rows
   */
  async all(sqlText, params = []) {
    const pgSql = formatPgQuery(sqlText);
    const res = await pool.query(pgSql, params);
    return res.rows;
  },

  /**
   * Execute INSERT, UPDATE, DELETE
   */
  async run(sqlText, params = []) {
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
  },

  /**
   * Test PostgreSQL connectivity
   */
  async testConnection() {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
      client.release();
      console.log(`[Database] ✅ PostgreSQL Connected: "${res.rows[0].db_name}" at ${res.rows[0].current_time}`);
      return true;
    } catch (err) {
      console.error(`[Database] ❌ PostgreSQL Connection Failed: ${err.message}`);
      console.error(`[Database] Please ensure PostgreSQL is running (e.g. 'podman start sharekart-postgres') or check DATABASE_URL in .env`);
      throw err;
    }
  }
};

// Check connection on server boot
db.testConnection().catch((err) => {
  console.error('[Database] Initial connection check warning:', err.message);
});

export default db;
