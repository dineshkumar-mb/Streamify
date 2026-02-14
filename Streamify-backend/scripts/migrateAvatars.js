import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config();

const migrateAvatars = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is not defined in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB via " + process.env.MONGO_URI);

        const users = await User.find({ profilePic: { $regex: "avatar.iran.liara.run" } });
        console.log(`Found ${users.length} users to migrate.`);

        for (const user of users) {
            const oldUrl = user.profilePic;
            // Extract the ID/Filename from the old URL
            // Old format: https://avatar.iran.liara.run/public/84.png
            // New format: https://api.dicebear.com/7.x/avataaars/svg?seed=84

            const match = oldUrl.match(/public\/(\d+)\.png/);
            if (match && match[1]) {
                const seed = match[1];
                const newUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

                user.profilePic = newUrl;
                await user.save({ validateBeforeSave: false });
                console.log(`Migrated user ${user.email}: ${oldUrl} -> ${newUrl}`);
            } else {
                console.warn(`Could not parse ID from URL for user ${user.email}: ${oldUrl}`);
            }
        }

        console.log("Migration complete.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateAvatars();
