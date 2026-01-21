import { pool } from "../config/db.config.js";

const updateContactStatusById = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE contacts SET status = ? WHERE id = ?',
    [status, id]
  );

  if (!result || result.affectedRows === 0) return null;

  const [rows] = await pool.query(
    'SELECT id, name, email, phone, message, status, created_at FROM contacts WHERE id = ? LIMIT 1',
    [id]
  );

  return rows.length ? rows[0] : null;
};

export { updateContactStatusById };
