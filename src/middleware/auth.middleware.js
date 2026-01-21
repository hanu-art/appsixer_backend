import { verifyToken } from '../utils/jwt.util.js';

const authMiddleware = async (req, res, next) => {
  try {



    const token = req.cookies?.token;
 
 

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const payload = verifyToken(token);

  
    if (!payload || !payload.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = { userId: payload.userId };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
