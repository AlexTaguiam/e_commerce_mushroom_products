import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

// Explicitly type the callback parameters to resolve the implicit 'any' errors
pool.query(
  "SELECT NOW()",
  (err: Error | null, res: pg.QueryResult | undefined) => {
    if (err) {
      console.error("❌ Database connection failed:", err.stack);
    } else if (res) {
      console.log(
        "✅ Connected to PostgreSQL Database successfully at:",
        res.rows[0].now,
      );
    }
  },
);

export default pool;
