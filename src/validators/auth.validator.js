
import { check, validationResult } from 'express-validator';

const registerRules = [
	check('email').isEmail().withMessage('Valid email required').normalizeEmail(),
	check('password')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters'),
];

const loginRules = [
	check('email').isEmail().withMessage('Valid email required').normalizeEmail(),
	check('password').exists().withMessage('Password is required'),
];

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ success: false, errors: errors.array() });
	}
	next();
};

export { registerRules, loginRules, validate };
