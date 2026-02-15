import express from "express";
import { login, logout, signup, getAuthUser, onboard, forgotPassword, resetPassword, googleAuthCallback } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"; // Correct name here
import passport from "../lib/passport.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/onboarding", protectRoute, onboard);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resetToken", resetPassword);
// Protected route
router.get("/me", protectRoute, getAuthUser);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    googleAuthCallback
);

export default router;
