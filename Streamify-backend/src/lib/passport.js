import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { upsertStreamUser } from "./stream.js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("FATAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not defined!");
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.NODE_ENV === "development" ? "http://localhost:5001/api/auth/google/callback" : "https://streamify-ncde.onrender.com/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const fullName = profile.displayName;
                const profilePic = profile.photos[0].value;

                // Check if user exists
                let user = await User.findOne({ email });

                if (!user) {
                    // Create new user
                    const idx = Math.floor(Math.random() * 100) + 1;
                    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`;

                    user = await User.create({
                        email,
                        fullName,
                        profilePic: profilePic || randomAvatar,
                    });

                    // Sync with Stream
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
