import express from "express";
import { login, logout, signup, getAuthUser,onboard } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"; // Correct name here

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/onboarding", protectRoute, onboard); 
// Protected route
router.get("/me", protectRoute, getAuthUser);

export default router;
