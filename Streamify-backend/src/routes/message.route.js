import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    saveMessage,
    getConversations,
    getMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

router.post("/", saveMessage);
router.get("/conversations", getConversations);
router.get("/:userId", getMessages);

export default router;
