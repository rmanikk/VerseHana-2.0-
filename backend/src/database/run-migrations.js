
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pool from "../config/database.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const migrationsDirectory = path.resolve(
  currentDirectory,
  "../../database/migrations"
);

async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const files = (await fs.readdir(migrationsDirectory))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const filename of files) {
      const existing = await client.query(
        "SELECT id FROM schema_migrations WHERE filename = $1",
        [filename]
      );

      if (existing.rowCount > 0) {
        console.log(`Already applied: ${filename}`);
        continue;
      }

      const filePath = path.join(migrationsDirectory, filename);
      const sql = await fs.readFile(filePath, "utf8");

      console.log(`Applying: ${filename}`);

      await client.query(sql);

      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [filename]
      );

      console.log(`Successfully applied: ${filename}`);
    }

    await client.query("COMMIT");

    console.log("Database migrations completed.");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Migration failed:", error.message);

    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

try {
  await runMigrations();
} catch {
  process.exitCode = 1;
}
