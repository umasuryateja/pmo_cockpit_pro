const { Pool } = require("pg");

// ─────────────────────────────────────────────────────────────
// Database connection — supports both local dev and production
// Set DATABASE_URL environment variable in production (Supabase/Railway)
// Falls back to local credentials for development
// ─────────────────────────────────────────────────────────────
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Supabase / hosted PostgreSQL
    })
  : new Pool({
      user:     process.env.DB_USER     || "postgres",
      host:     process.env.DB_HOST     || "localhost",
      database: process.env.DB_NAME     || "pmo_cockpit_pro_v2",
      password: process.env.DB_PASSWORD || "12345678",
      port:     parseInt(process.env.DB_PORT || "5432"),
    });

module.exports = pool;