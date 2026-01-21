import bcrypt from 'bcrypt';
import { findByEmail, createUser  , findById} from '../models/user.model.js';
import { generateToken, parseExpiryToMs } from '../utils/jwt.util.js';
import { successResponse } from '../utils/response.util.js';
import { config } from '../config/env.config.js';
/**
 * REGISTER
 * - koi bhi email
 * - password hash hoga
 */
const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await findByEmail(email);
    if (existingUser) {
      const err = new Error('User already registered');
      err.statusCode = 409;
      return next(err);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await createUser({
      email,
      password: hashedPassword,
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Registered successfully',
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * LOGIN
 * - email DB me mile
 * - password match ho
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findByEmail(email);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      return next(err);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      return next(err);
    }

    const token = generateToken({ userId: user.id });

    const expiresIn = config.jwt.expiresIn || '7d';
    const maxAge = parseExpiryToMs(expiresIn);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Logged in successfully',
      data: {
        email: user.email,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * LOGOUT
 * - cookie clear
 */
const logout = async (req, res, next) => {
  try {

    console.log(req)
    res.clearCookie('token', {
      httpOnly: true,
      secure:false,
      sameSite: 'lax',
      path: '/',
    });

    return successResponse(res, {
      statusCode: 200,
      message: 'Logged out successfully',
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET ME
 * - auth middleware req.user set karega
 */
const getMe = async (req, res, next) => {
  try {
    const user = await findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return successResponse(res, {
      statusCode: 200,
      data: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export { register, login, logout, getMe };
