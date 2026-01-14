import { config } from '../config/env.config.js';
import jwt from 'jsonwebtoken';

const generateToken = (payload) => {
	const secret = config.jwt.secret;
	const expiresIn = config.jwt.expiresIn || '7d';
	return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
	const secret = process.env.JWT_SECRET;
	return jwt.verify(token, secret);
};

const parseExpiryToMs = (str) => {
	if (!str) return 0;
	if (/^\d+$/.test(str)) return parseInt(str, 10) * 1000;
	const m = str.match(/^(\d+)([smhd])$/);
	if (!m) return 0;
	const v = parseInt(m[1], 10);
	const unit = m[2];
	if (unit === 's') return v * 1000;
	if (unit === 'm') return v * 60 * 1000;
	if (unit === 'h') return v * 60 * 60 * 1000;
	if (unit === 'd') return v * 24 * 60 * 60 * 1000;
	return 0;
};

export { generateToken, verifyToken, parseExpiryToMs };
