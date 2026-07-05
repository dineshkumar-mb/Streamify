import mongoose from "mongoose";

const callRatingSchema = new mongoose.Schema(
    {
        callId: {
            type: String,
            required: true,
        },
        raterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ratedUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        callType: {
            type: String,
            enum: ["audio", "video"],
            default: "video",
        },
    },
    { timestamps: true }
);

const CallRating = mongoose.model("CallRating", callRatingSchema);
export default CallRating;
