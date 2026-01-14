import { check, validationResult } from 'express-validator';

const createContactRules = [
	check('name').trim().notEmpty().withMessage('Name is required'),
	check('email').isEmail().withMessage('Valid email required').normalizeEmail(),
	check('message').trim().notEmpty().withMessage('Message is required'),
	check('phone')
		.optional({ checkFalsy: true })
		.isMobilePhone('any')
		.withMessage('Phone must be a valid phone number'),
];

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ success: false, errors: errors.array() });
	}
	next();
};

export { createContactRules, validate };
