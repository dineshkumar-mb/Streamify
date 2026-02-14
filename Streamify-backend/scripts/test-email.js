
import { sendEmail } from "../src/lib/email.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("Testing email sending...");
console.log("Using credentials:", {
    user: process.env.EMAIL_USER,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT
});

try {
    await sendEmail({
        email: "dineshmechpct@gmail.com", // Sending to self
        subject: "Test Email from Streamify",
        message: "<h1>This is a test email</h1><p>If you see this, email sending is working!</p>"
    });
    console.log("Email sent successfully!");
} catch (error) {
    console.error("Failed to send email:", error);
}
