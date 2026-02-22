import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  submitCallRating,
  getUserRating,
} from "../controllers/user.controller.js";
import {
  getAvailableStickers,
  downloadStickerPack,
  removeStickerPack,
} from "../controllers/sticker.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

router.post("/call-rating", submitCallRating);
router.get("/call-rating/:userId", getUserRating);

// Sticker Routes
router.get("/stickers", getAvailableStickers);
router.post("/stickers/:packId/download", downloadStickerPack);
router.delete("/stickers/:packId/remove", removeStickerPack);

export default router;