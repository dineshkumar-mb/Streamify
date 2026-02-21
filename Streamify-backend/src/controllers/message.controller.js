import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

/**
 * POST /api/messages
 * Save a message to MongoDB and upsert the conversation.
 */
export async function saveMessage(req, res) {
    try {
        const senderId = req.user.id;
        const { receiverId, content, messageType = "text", streamMsgId } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ message: "receiverId and content are required" });
        }

        if (!isValidObjectId(receiverId)) {
            return res.status(400).json({ message: "Invalid receiverId" });
        }

        // Cap content length and validate type
        const safeContent = String(content).slice(0, 5000);
        const safeType = ["text", "voice", "call"].includes(messageType) ? messageType : "text";

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId], $size: 2 },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                lastMessage: safeContent,
                lastMessageAt: new Date(),
                lastMessageType: safeType,
            });
        } else {
            conversation.lastMessage = safeContent;
            conversation.lastMessageAt = new Date();
            conversation.lastMessageType = safeType;
            await conversation.save();
        }

        // Save message — upsert by streamMsgId to prevent duplicates
        let message;
        if (streamMsgId) {
            message = await Message.findOneAndUpdate(
                { streamMsgId },
                {
                    conversationId: conversation._id,
                    sender: senderId,
                    receiver: receiverId,
                    content: safeContent,
                    messageType: safeType,
                    streamMsgId,
                },
                { upsert: true, new: true }
            );
        } else {
            message = await Message.create({
                conversationId: conversation._id,
                sender: senderId,
                receiver: receiverId,
                content: safeContent,
                messageType: safeType,
            });
        }

        res.status(201).json({ message, conversationId: conversation._id });
    } catch (error) {
        console.error("Error in saveMessage controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * GET /api/messages/conversations
 * Return all conversations for the logged-in user, sorted by latest message.
 */
export async function getConversations(req, res) {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: { $in: [userId] },
        })
            .sort({ lastMessageAt: -1 })
            .populate("participants", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error in getConversations controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * GET /api/messages/:userId
 * Return all messages between the logged-in user and :userId.
 */
export async function getMessages(req, res) {
    try {
        const myId = req.user.id;
        const { userId: otherId } = req.params;
        const { limit = 100, before } = req.query;

        if (!isValidObjectId(otherId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        // Cap limit to prevent large data dumps
        const safeLimit = Math.min(Number(limit) || 100, 200);

        const conversation = await Conversation.findOne({
            participants: { $all: [myId, otherId], $size: 2 },
        });

        if (!conversation) {
            return res.status(200).json({ messages: [], conversationId: null });
        }

        const query = { conversationId: conversation._id };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: 1 })
            .limit(safeLimit)
            .populate("sender", "fullName profilePic")
            .populate("receiver", "fullName profilePic");

        res.status(200).json({ messages, conversationId: conversation._id });
    } catch (error) {
        console.error("Error in getMessages controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
