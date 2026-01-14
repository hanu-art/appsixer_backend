import mysql from 'mysql2/promise';
import { config } from './env.config.js';

const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.on('connection', (connection) => {
  console.log('MySQL connected');
});

pool.on('error', (err) => {
  console.error('MySQL pool error:', err);
});

export { pool };