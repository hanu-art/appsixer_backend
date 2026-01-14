
import { pool } from '../config/db.config.js';

const createContact = async ({ name, email, phone = null, message, status = 'new' }) => {
	const createdAt = new Date();
	const [result] = await pool.query(
		'INSERT INTO contacts (name, email, phone, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
		[name, email, phone, message, status, createdAt]
	);
	return { id: result.insertId, name, email, phone, message, status, created_at: createdAt };
};

const countContacts = async () => {
	const [rows] = await pool.query('SELECT COUNT(*) as count FROM contacts');
	return rows[0] ? Number(rows[0].count) : 0;
};

const findContacts = async ({ offset = 0, limit = 10 }) => {
	const [rows] = await pool.query(
		'SELECT id, name, email, phone, message, status, created_at FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?',
		[Number(limit), Number(offset)]
	);
	return rows;
};

const findContactById = async (id) => {
	const [rows] = await pool.query(
		'SELECT id, name, email, phone, message, status, created_at FROM contacts WHERE id = ? LIMIT 1',
		[id]
	);
	return rows.length ? rows[0] : null;
};

const findLatest = async (limit = 5) => {
	const [rows] = await pool.query(
		'SELECT id, name, email, phone, message, status, created_at FROM contacts ORDER BY created_at DESC LIMIT ?',
		[Number(limit)]
	);
	return rows;
};

export { createContact, countContacts, findContacts, findContactById, findLatest };
