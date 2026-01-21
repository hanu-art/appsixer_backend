import express from "express";
import { getContactStats } from "../controllers/count.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /admin/contacts/stats
router.get(
  "/contacts/stats",
  authMiddleware,
  getContactStats
);

export default router;
