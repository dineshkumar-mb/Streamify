import { useState, useEffect } from "react";
import { Star, PhoneOff } from "lucide-react";

const CallRatingModal = ({ callId, callType, ratedUser, onSubmit, onSkip }) => {
    const [hovered, setHovered] = useState(0);
    const [selected, setSelected] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(30);

    // Auto-dismiss countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(timer);
                    onSkip();
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onSkip]);

    const handleSubmit = async () => {
        if (!selected) return;
        setSubmitting(true);
        await onSubmit(selected);
        setSubmitting(false);
    };

    const starLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onSkip}
            />

            {/* Modal card */}
            <div
                className="relative w-full sm:max-w-sm mx-4 sm:mx-auto rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
                style={{
                    background: "oklch(17% 0.03 150)",
                    border: "1px solid oklch(70% 0.15 150 / 0.15)",
                }}
            >
                {/* Call ended badge */}
                <div className="flex justify-center mb-4">
                    <div
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
                        style={{
                            background: "oklch(30% 0.08 5 / 0.5)",
                            color: "oklch(75% 0.15 5)",
                            border: "1px solid oklch(60% 0.15 5 / 0.3)",
                        }}
                    >
                        <PhoneOff className="size-3.5" />
                        {callType === "audio" ? "Voice" : "Video"} call ended
                    </div>
                </div>

                {/* Avatar + name */}
                {ratedUser && (
                    <div className="flex flex-col items-center mb-5">
                        <div className="avatar mb-2">
                            <div className="w-16 h-16 rounded-full ring-2 ring-primary/30">
                                <img
                                    src={
                                        ratedUser.image ||
                                        `https://api.dicebear.com/7.x/initials/svg?seed=${ratedUser.name}`
                                    }
                                    alt={ratedUser.name}
                                />
                            </div>
                        </div>
                        <p className="text-lg font-bold">{ratedUser.name}</p>
                        <p className="text-sm opacity-50 mt-0.5">How was your call?</p>
                    </div>
                )}

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            onClick={() => setSelected(star)}
                            className="transition-transform hover:scale-125 active:scale-95"
                        >
                            <Star
                                className="size-9 transition-colors"
                                fill={star <= (hovered || selected) ? "#f59e0b" : "transparent"}
                                stroke={star <= (hovered || selected) ? "#f59e0b" : "oklch(50% 0 0)"}
                            />
                        </button>
                    ))}
                </div>

                {/* Star label */}
                <p
                    className="text-center text-sm font-medium mb-5 h-5 transition-all"
                    style={{ color: "oklch(75% 0.15 80)" }}
                >
                    {starLabels[hovered || selected]}
                </p>

                {/* Actions */}
                <button
                    className="btn btn-primary w-full mb-3"
                    onClick={handleSubmit}
                    disabled={!selected || submitting}
                >
                    {submitting ? (
                        <span className="loading loading-spinner loading-sm" />
                    ) : (
                        "Submit Rating"
                    )}
                </button>

                <button
                    className="btn btn-ghost w-full text-sm opacity-50 hover:opacity-80"
                    onClick={onSkip}
                >
                    Skip · auto-closes in {countdown}s
                </button>
            </div>
        </div>
    );
};

export default CallRatingModal;
