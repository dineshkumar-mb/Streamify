import { Check, CheckCheck, Trash2 } from "lucide-react";
import { decryptMessage } from "../lib/encryption";
import { useMessageContext, useChannelStateContext, ReactionsList, useChatContext } from "stream-chat-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const CustomMessage = () => {
    const { message, isMyMessage, handleAction } = useMessageContext();
    const { read, channel } = useChannelStateContext();
    const { client } = useChatContext();
    const [canDelete, setCanDelete] = useState(false);

    const decryptedText = decryptMessage(message.text);

    useEffect(() => {
        if (!isMyMessage || message.type === 'deleted') return;

        const checkAge = () => {
            const createdAt = new Date(message.created_at);
            const now = new Date();
            const ageInSeconds = (now - createdAt) / 1000;
            setCanDelete(ageInSeconds < 60);
        };

        checkAge();
        const interval = setInterval(checkAge, 5000); // Check every 5s

        return () => clearInterval(interval);
    }, [message.created_at, isMyMessage, message.type]);

    const handleDelete = async () => {
        try {
            await client.deleteMessage(message.id, true); // hard delete
            toast.success("Message deleted for everyone");
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        }
    };

    const isRead = () => {
        const messageTime = new Date(message.created_at).getTime();
        return Object.values(read).some(
            (userRead) =>
                userRead.last_read.getTime() >= messageTime && userRead.user.id !== message.user.id
        );
    };

    const renderStatus = () => {
        if (!isMyMessage) return null;

        if (message.status === "sending") {
            return <Check className="size-3 opacity-50" />;
        }

        if (isRead()) {
            return <CheckCheck className="size-3 text-blue-500" />;
        }

        return <CheckCheck className="size-3 opacity-50" />;
    };

    return (
        <div className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"} mb-4 w-full group transition-all`}>
            <div
                className={`max-w-[85%] sm:max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow-sm relative ${isMyMessage
                    ? "bg-primary text-primary-content rounded-tr-none"
                    : "bg-base-200 text-base-content rounded-tl-none border border-base-300"
                    }`}
            >
                {/* REPLIED MESSAGE (if exists) */}
                {message.parent_id && (
                    <div className="mb-2 p-2 bg-base-300/30 rounded-lg border-l-4 border-accent text-[11px] opacity-80 cursor-pointer" onClick={() => handleAction({ name: 'jump_to_message', parent_id: message.parent_id })}>
                        Replying to a message...
                    </div>
                )}

                {/* VOICE MESSAGE */}
                {message.attachments?.some(a => a.type === 'voice') ? (
                    <div className="flex items-center gap-2 py-1 min-w-[200px]">
                        <audio
                            src={message.attachments.find(a => a.type === 'voice').asset_url}
                            controls
                            className="h-8 max-w-full"
                        />
                    </div>
                ) : message.attachments?.some(a => a.type === 'sticker') ? (
                    <div className="flex flex-col items-center">
                        <img
                            src={message.attachments.find(a => a.type === 'sticker').image_url}
                            alt="Sticker"
                            className="w-32 h-32 object-contain"
                        />
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap break-words">{decryptedText}</p>
                )}

                <div className="flex items-center justify-end gap-1 mt-1 leading-none">
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            className="btn btn-ghost btn-circle btn-xs text-error/40 hover:text-error opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                            title="Delete for everyone"
                        >
                            <Trash2 className="size-3" />
                        </button>
                    )}
                    <span className="text-[10px] opacity-70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </span>
                    {renderStatus()}
                </div>

                {/* REACTIONS */}
                <div className="absolute -bottom-4 left-0 w-full flex justify-start pl-2">
                    <ReactionsList />
                </div>
            </div>
        </div>
    );
};

export default CustomMessage;
