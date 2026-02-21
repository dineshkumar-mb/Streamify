import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        // Always exactly 2 participants for 1-on-1 chats
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        lastMessage: {
            type: String,
            default: "",
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        lastMessageType: {
            type: String,
            enum: ["text", "voice", "call"],
            default: "text",
        },
    },
    { timestamps: true }
);

// Unique index — one conversation per pair of users
conversationSchema.index({ participants: 1 }, { unique: false });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
