import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: false // railway por proxy costuma aceitar sem SSL; se precisar -> { rejectUnauthorized: false }
});

// pequeno helper pra query com log opcional
export const q = async (text, params = []) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error('DB ERROR:', err.message);
    throw err;
  }
};
