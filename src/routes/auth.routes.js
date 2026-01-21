
import express from 'express';
import { registerRules, loginRules, validate } from '../validators/auth.validator.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { register , login , logout , getMe } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate,login);
router.post('/logout',  logout);
router.get('/me', authMiddleware, getMe);

export default router;
