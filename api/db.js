
const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5
});

module.exports = pool;
