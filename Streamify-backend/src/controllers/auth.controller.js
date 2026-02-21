import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../lib/email.js";

/* ─── helpers ────────────────────────────────────────────── */

const setTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV !== "development",
  });
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

/* ─── controllers ────────────────────────────────────────── */

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Truncate inputs to prevent oversized strings
    const safeEmail = String(email).toLowerCase().slice(0, 254);
    const safeFullName = String(fullName).slice(0, 100);

    const existingUser = await User.findOne({ email: safeEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a different one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`;

    const newUser = await User.create({
      email: safeEmail,
      fullName: safeFullName,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
    } catch (err) {
      console.error("Error creating Stream user:", err.message);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    setTokenCookie(res, token);

    // Never expose password or token in response body
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAuthUser = (req, res) => {
  res.status(200).json({ user: req.user });
};

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const safeEmail = String(email).toLowerCase().slice(0, 254);
    const user = await User.findOne({ email: safeEmail });

    // Generic message — don't reveal whether email exists
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    setTokenCookie(res, token);

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV !== "development",
  });
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    // ✅ Explicitly pick only safe fields — never spread req.body into DB
    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    // Sanitize lengths
    const updateData = {
      fullName: String(fullName).slice(0, 100),
      bio: String(bio).slice(0, 500),
      nativeLanguage: String(nativeLanguage).slice(0, 50),
      learningLanguage: String(learningLanguage).slice(0, 50),
      location: String(location).slice(0, 100),
      isOnboarded: true,
    };

    if (profilePic) updateData.profilePic = String(profilePic).slice(0, 500);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
    } catch (streamError) {
      console.error("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // ✅ Always return 200 to prevent email enumeration
  const safeResponse = () =>
    res.status(200).json({ success: true, data: "If that email exists, a reset link has been sent." });

  try {
    if (!email || !isValidEmail(email)) return safeResponse();

    const safeEmail = String(email).toLowerCase().slice(0, 254);
    const user = await User.findOne({ email: safeEmail });

    // Don't leak whether the email exists
    if (!user) return safeResponse();

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    const origin = req.headers.origin;
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://streamify-frontend-iota.vercel.app",
      "https://streamify-ncde.onrender.com",
      "https://streamify-inky-one.vercel.app",
    ];

    const clientUrl = allowedOrigins.includes(origin)
      ? origin
      : process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password. This link expires in 10 minutes.</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({ email: user.email, subject: "Password Reset Request", message });
    } catch (emailErr) {
      console.error("Error sending reset email:", emailErr.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    // Always return the same response regardless of outcome
    return safeResponse();
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return safeResponse(); // Still don't leak info
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const googleAuthCallback = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      const fallback = process.env.CLIENT_URL_PROD || "https://streamify-inky-one.vercel.app";
      return res.redirect(`${fallback}/login?error=GoogleAuthFailed`);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    // ✅ Set token as httpOnly cookie only — do NOT expose in URL
    setTokenCookie(res, token);

    const clientUrl =
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_URL_DEV || "http://localhost:5173"
        : process.env.CLIENT_URL_PROD || "https://streamify-inky-one.vercel.app";

    // Redirect without token in URL — frontend reads auth state from cookie
    res.redirect(`${clientUrl.replace(/\/$/, "")}`);
  } catch (error) {
    console.error("Error in googleCallback:", error);
    const clientUrl =
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_URL_DEV || "http://localhost:5173"
        : process.env.CLIENT_URL_PROD || "https://streamify-inky-one.vercel.app";

    res.redirect(`${clientUrl.replace(/\/$/, "")}/login?error=GoogleAuthFailed`);
  }
};
