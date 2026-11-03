import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl:
    process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : false,

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("connect", () => {
  console.log("PostgreSQL connection established.");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

export const query = (text, params) => {
  return pool.query(text, params);
};

export const testDatabaseConnection = async () => {
  const result = await pool.query("SELECT NOW()");

  return result.rows[0];
};

export default pool;