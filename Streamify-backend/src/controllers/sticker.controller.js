import User from "../models/User.js";

// Hardcoded external sticker packages. In a real app, this could be in DB or from an external API (like Giphy).
export const AVAILABLE_STICKER_PACKAGES = [
    {
        id: "pack_fun_emojis",
        name: "Fun Emojis",
        thumbnail: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smile",
        stickers: [
            "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smile",
            "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sad",
            "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Wink",
            "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Love",
        ],
    },
    {
        id: "pack_bottts",
        name: "Cool Bots",
        thumbnail: "https://api.dicebear.com/7.x/bottts/svg?seed=Alpha",
        stickers: [
            "https://api.dicebear.com/7.x/bottts/svg?seed=Alpha",
            "https://api.dicebear.com/7.x/bottts/svg?seed=Beta",
            "https://api.dicebear.com/7.x/bottts/svg?seed=Gamma",
            "https://api.dicebear.com/7.x/bottts/svg?seed=Delta",
        ],
    },

    {
        id: "pack_avatars",
        name: "Avatars",
        thumbnail: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        stickers: [
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
            "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi",
        ],
    },
];

export const getAvailableStickers = async (req, res) => {
    try {
        // Optionally return User's downloaded history attached, or just raw packages
        const user = await User.findById(req.user._id).select("downloadedStickers");

        const packagesWithStatus = AVAILABLE_STICKER_PACKAGES.map((pack) => ({
            ...pack,
            isDownloaded: user.downloadedStickers.includes(pack.id),
        }));

        res.status(200).json(packagesWithStatus);
    } catch (error) {
        console.error("Error in getAvailableStickers:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const downloadStickerPack = async (req, res) => {
    try {
        const { packId } = req.params;
        const userId = req.user._id;

        const packExists = AVAILABLE_STICKER_PACKAGES.find((p) => p.id === packId);
        if (!packExists) {
            return res.status(404).json({ message: "Sticker pack not found" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { downloadedStickers: packId } },
            { new: true }
        ).select("-password");

        res.status(200).json({ message: "Pack downloaded successfully", user: updatedUser });
    } catch (error) {
        console.error("Error in downloadStickerPack:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeStickerPack = async (req, res) => {
    try {
        const { packId } = req.params;
        const userId = req.user._id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { downloadedStickers: packId } },
            { new: true }
        ).select("-password");

        res.status(200).json({ message: "Pack removed successfully", user: updatedUser });
    } catch (error) {
        console.error("Error in removeStickerPack:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
