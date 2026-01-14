
import express from 'express';
import { createContactRules, validate } from '../validators/contact.validator.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { create, list, getById, latest } from '../controllers/contact.controller.js';

const router = express.Router();

router.post('/contacts', createContactRules, validate, create);

router.get('/admin/contacts', authMiddleware, list);
router.get('/admin/contacts/latest', authMiddleware, latest);
router.get('/admin/contacts/:id', authMiddleware, getById);

export default router;
