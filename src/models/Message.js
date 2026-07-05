import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Encrypted content — same ciphertext stored in Stream
        content: {
            type: String,
            default: "",
        },
        messageType: {
            type: String,
            enum: ["text", "voice", "call"],
            default: "text",
        },
        // Stream's message ID — used to avoid double-saving
        streamMsgId: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    { timestamps: true }
);

// Index for fast conversation lookups
messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
