import pg from "pg";

const pool = new pg.Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "",
  database: "reconciliation",
});

export default {
  query: async (text: string, params: any[]) => {
    return await pool.query(text, params).catch((err) => {
      throw err;
    });
  },
};
