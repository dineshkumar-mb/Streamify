import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Explicitly load .env from the backend directory
dotenv.config({ path: path.join(__dirname, ".env") });

// Now import the server dynamically to ensure env vars are loaded first
await import("./src/server.js");
