const { Pool } = require("pg");

// Production (Render): set DATABASE_URL to Supabase connection URI.
// Local dev: DATABASE_URL or DB_* variables.
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.DATABASE_URL) {
  console.error(
    "[DB] FATAL: DATABASE_URL is required in production. Set your Supabase URI on Render."
  );
  process.exit(1);
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "pmo_cockpit_pro_v2",
      password: process.env.DB_PASSWORD || "12345678",
      port: parseInt(process.env.DB_PORT || "5432", 10),
    });

async function verifyDatabaseConnection() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0]?.ok === 1;
}

module.exports = pool;
module.exports.verifyDatabaseConnection = verifyDatabaseConnection;