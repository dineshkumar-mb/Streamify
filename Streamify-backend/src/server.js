import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import mongoSanitize from "mongo-sanitize";
import hpp from "hpp";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import { authLimiter, oauthLimiter, apiLimiter } from "./middleware/rateLimiter.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001;

/* ── Environment variable guard ─────────────────────────── */
if (!process.env.JWT_SECRET_KEY) console.error("FATAL ERROR: JWT_SECRET_KEY is not defined!");
if (!process.env.MONGO_URI) console.error("FATAL ERROR: MONGO_URI is not defined!");

const __dirname = path.resolve();

/* ── Trusted origins ─────────────────────────────────────── */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://streamify-frontend-iota.vercel.app",
  "https://streamify-ncde.onrender.com",
  "https://streamify-inky-one.vercel.app",
];

/* ── Security headers (helmet) ───────────────────────────── */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Stream Video SDK needs this off
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://*.stream-io-api.com",
          "https://*.getstream.io",
          "wss://*.stream-io-api.com",
        ],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        mediaSrc: ["'self'", "blob:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Vite needs inline scripts in dev
        styleSrc: ["'self'", "'unsafe-inline'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
  })
);

/* ── CORS ────────────────────────────────────────────────── */
app.use(
  cors({
    origin: function (origin, callback) {
      // Block requests with no origin in production (curl, Postman, etc.)
      if (!origin) {
        if (process.env.NODE_ENV === "development") return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.set("trust proxy", 1);

/* ── Body + cookie parsing ───────────────────────────────── */
app.use(express.json({ limit: "10kb" }));         // Prevent large-payload DoS
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* ── NoSQL injection sanitization ───────────────────────── */
// Sanitizes req.body, req.params, req.query recursively
app.use((req, _res, next) => {
  req.body = mongoSanitize(req.body);
  req.params = mongoSanitize(req.params);
  req.query = mongoSanitize(req.query);
  next();
});

/* ── HTTP Parameter Pollution prevention ─────────────────── */
app.use(hpp());

import passport from "./lib/passport.js";
app.use(passport.initialize());

/* ── Rate Limiting ───────────────────────────────────────── */
app.use("/api/auth/google", oauthLimiter);   // Lenient — OAuth redirects need headroom
app.use("/api/auth", authLimiter);           // Strict — login/signup/forgot-password
app.use("/api/users", apiLimiter);           // General — 100 req/15 min
app.use("/api/messages", apiLimiter);
app.use("/api/chat", apiLimiter);

/* ── Routes ──────────────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).send("OK");
});

/* ── Production static files ─────────────────────────────── */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});