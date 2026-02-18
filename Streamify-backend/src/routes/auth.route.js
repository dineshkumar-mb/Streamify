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

router.get("/google", (req, res, next) => {
    // Dynamically determine the callback URL based on the request protocol and host
    const callbackURL = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
    passport.authenticate("google", {
        scope: ["profile", "email"],
        callbackURL
    })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
    const callbackURL = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false,
        callbackURL
    }, (err, user, info) => {
        if (err || !user) {
            const clientUrl = process.env.NODE_ENV === "development"
                ? (process.env.CLIENT_URL_DEV || "http://localhost:5173")
                : (process.env.CLIENT_URL_PROD || "https://streamify-inky-one.vercel.app");
            return res.redirect(`${clientUrl.replace(/\/$/, "")}/login?error=GoogleAuthFailed`);
        }
        req.user = user;
        googleAuthCallback(req, res);
    })(req, res, next);
});

export default router;
