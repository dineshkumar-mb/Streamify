import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001;

if (!process.env.JWT_SECRET_KEY) console.error("FATAL ERROR: JWT_SECRET_KEY is not defined!");
if (!process.env.MONGO_URI) console.error("FATAL ERROR: MONGO_URI is not defined!");

const __dirname = path.resolve();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://streamify-frontend-iota.vercel.app",
    ],
    credentials: true, // allow frontend to send cookies
  })
);


app.use(express.json());
app.set("trust proxy", 1); // trust first proxy
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});