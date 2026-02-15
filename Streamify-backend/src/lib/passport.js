import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { upsertStreamUser } from "./stream.js";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("FATAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not defined!");
    console.warn("Please add these to your Render dashboard Environment Variables.");
}

// We initialize the strategy even if keys are missing to avoid crashing the server,
// but we use placeholder strings if necessary. This allows the server to boot up
// and display the error message instead of a generic 'TypeError'.
passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID || "MISSING_CLIENT_ID",
            clientSecret: GOOGLE_CLIENT_SECRET || "MISSING_CLIENT_SECRET",
            callbackURL: process.env.NODE_ENV === "development"
                ? "http://localhost:5001/api/auth/google/callback"
                : "https://streamify-ncde.onrender.com/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const fullName = profile.displayName;
                const profilePic = profile.photos[0].value;

                let user = await User.findOne({ email });

                if (!user) {
                    const idx = Math.floor(Math.random() * 100) + 1;
                    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`;

                    user = await User.create({
                        email,
                        fullName,
                        profilePic: profilePic || randomAvatar,
                    });

                    try {
                        await upsertStreamUser({
                            id: user._id.toString(),
                            name: user.fullName,
                            image: user.profilePic || "",
                        });
                        console.log(`Stream user created for ${user.fullName}`);
                    } catch (error) {
                        console.log("Error creating Stream user:", error);
                    }
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
