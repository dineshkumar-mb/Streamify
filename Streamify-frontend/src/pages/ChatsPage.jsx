import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { decryptMessage } from "../lib/encryption";
import { MessageCircle, Search } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatsPage = () => {
    const navigate = useNavigate();
    const { authUser } = useAuthUser();
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chatClient, setChatClient] = useState(null);
    const [search, setSearch] = useState("");

    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    // Initialize Stream client and load channels
    useEffect(() => {
        if (!tokenData?.token || !authUser) return;

        let client;

        const init = async () => {
            try {
                client = StreamChat.getInstance(STREAM_API_KEY);

                // Connect only if not already connected
                if (!client.userID) {
                    await client.connectUser(
                        {
                            id: authUser._id,
                            name: authUser.fullName,
                            image: authUser.profilePic,
                        },
                        tokenData.token
                    );
                }

                setChatClient(client);

                // Query all channels this user is a member of, sorted by last message
                const filter = { members: { $in: [authUser._id] } };
                const sort = [{ last_message_at: -1 }];
                const options = { limit: 30, state: true, watch: false, presence: false };

                const fetchedChannels = await client.queryChannels(filter, sort, options);
                setChannels(fetchedChannels);
            } catch (err) {
                console.error("Error loading chats:", err);
            } finally {
                setLoading(false);
            }
        };

        init();

        return () => {
            // Don't disconnect here — ChatPage also uses this client
        };
    }, [tokenData, authUser]);

    // Get the other member of a 1-on-1 channel
    const getOtherMember = (channel) => {
        const members = Object.values(channel.state.members);
        return members.find((m) => m.user?.id !== authUser?._id)?.user;
    };

    // Get last message text (decrypted)
    const getLastMessage = (channel) => {
        const msg = channel.state.messages[channel.state.messages.length - 1];
        if (!msg) return "No messages yet";
        if (msg.attachments?.some((a) => a.type === "voice")) return "🎙️ Voice message";
        if (!msg.text) return "Attachment";
        const decrypted = decryptMessage(msg.text);
        return decrypted.length > 55 ? decrypted.slice(0, 55) + "…" : decrypted;
    };

    // Get unread count
    const getUnread = (channel) => {
        return channel.countUnread() || 0;
    };

    // Format timestamp
    const formatTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) {
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
        }
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    // Navigate to chat — extract target user ID from channel members
    const openChat = (channel) => {
        const other = getOtherMember(channel);
        if (other) navigate(`/chat/${other.id}`);
    };

    // Filter by search
    const filtered = channels.filter((ch) => {
        const other = getOtherMember(ch);
        if (!other) return false;
        return other.name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="h-full flex flex-col bg-base-100">
            {/* Header */}
            <div className="px-4 pt-6 pb-3 border-b border-base-300">
                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="size-6 text-primary" />
                    Chats
                </h1>
                {/* Search */}
                <label className="input input-bordered flex items-center gap-2 w-full">
                    <Search className="size-4 opacity-50" />
                    <input
                        type="text"
                        placeholder="Search conversations…"
                        className="grow bg-transparent outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-base-200">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 gap-3">
                        <MessageCircle className="size-12" />
                        <p className="text-lg font-medium">
                            {search ? "No results found" : "No conversations yet"}
                        </p>
                        {!search && (
                            <p className="text-sm">
                                Start chatting with a friend from the{" "}
                                <span
                                    className="text-primary cursor-pointer hover:underline"
                                    onClick={() => navigate("/")}
                                >
                                    Home page
                                </span>
                            </p>
                        )}
                    </div>
                ) : (
                    filtered.map((channel) => {
                        const other = getOtherMember(channel);
                        if (!other) return null;
                        const unread = getUnread(channel);
                        const lastMsg = channel.state.messages[channel.state.messages.length - 1];

                        return (
                            <button
                                key={channel.id}
                                onClick={() => openChat(channel)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-base-200 transition-colors text-left"
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded-full">
                                            <img
                                                src={other.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other.id}`}
                                                alt={other.name}
                                                onError={(e) => {
                                                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${other.name}`;
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {/* Online dot */}
                                    {other.online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={`font-semibold truncate ${unread > 0 ? "text-base-content" : "text-base-content/80"}`}>
                                            {other.name || "Unknown"}
                                        </span>
                                        <span className={`text-xs flex-shrink-0 ml-2 ${unread > 0 ? "text-primary font-medium" : "opacity-50"}`}>
                                            {formatTime(lastMsg?.created_at || channel.data?.created_at)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-sm truncate ${unread > 0 ? "text-base-content font-medium" : "opacity-60"}`}>
                                            {getLastMessage(channel)}
                                        </p>
                                        {unread > 0 && (
                                            <span className="badge badge-primary badge-sm flex-shrink-0 min-w-[1.25rem]">
                                                {unread > 99 ? "99+" : unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ChatsPage;
