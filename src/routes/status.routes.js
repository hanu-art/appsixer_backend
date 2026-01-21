import express from "express"; 
import { updateStatus } from "../controllers/status.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = express.Router();  


router.patch("/contacts/:id/status", authMiddleware, updateStatus);

export default router;