
import { pool } from '../config/db.config.js';

const findByEmail = async (email) => {
	const [rows] = await pool.query(
		'SELECT id, email, password, created_at FROM users WHERE email = ? LIMIT 1',
		[email]
	);
	return rows.length ? rows[0] : null;
};

const createUser = async ({ email, password }) => {
	const createdAt = new Date();
	const [result] = await pool.query(
		'INSERT INTO users (email, password, created_at) VALUES (?, ?, ?)',
		[email, password, createdAt]
	);
	return { id: result.insertId, email, created_at: createdAt };
}; 

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, email, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows.length ? rows[0] : null;
};

export { findByEmail, createUser  , findById};
