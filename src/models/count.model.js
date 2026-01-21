import { pool } from "../config/db.config.js";
const getContactStatsFromDB = async () => {
  const query = `
    SELECT
      COUNT(*) AS total,
      SUM(status = 'new') AS new,
      SUM(status = 'contacted') AS contacted,
      SUM(status = 'resolved') AS resolved
    FROM contacts
  `;

  const [rows] = await pool.execute(query);

  return {
    total: Number(rows[0].total),
    new: Number(rows[0].new),
    contacted: Number(rows[0].contacted),
    resolved: Number(rows[0].resolved),
  };
};

export { getContactStatsFromDB };
