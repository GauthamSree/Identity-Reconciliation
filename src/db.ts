import pg from "pg";
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.DB_CONNECTION,
  });

export default {
  query: async (text: string, params: any[]) => {
    return await pool.query(text, params).catch((err) => {
      throw err;
    });
  },
};
