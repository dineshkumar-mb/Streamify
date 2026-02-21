import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, getMongoConversations } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { decryptMessage } from "../lib/encryption";
import { MessageCircle, Search, Database } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatsPage = () => {
    const navigate = useNavigate();
    const { authUser } = useAuthUser();
    const [streamChannels, setStreamChannels] = useState([]);
    const [streamLoading, setStreamLoading] = useState(true);
    const [chatClient, setChatClient] = useState(null);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("recent"); // 'recent' | 'mongo'

    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    // MongoDB conversations (persistent backup)
    const { data: mongoConvos = [], isLoading: mongoLoading } = useQuery({
        queryKey: ["mongoConversations"],
        queryFn: getMongoConversations,
        enabled: !!authUser,
    });

    // Initialize Stream client and load channels
    useEffect(() => {
        if (!tokenData?.token || !authUser) return;

        let client;
        const init = async () => {
            try {
                client = StreamChat.getInstance(STREAM_API_KEY);
                if (!client.userID) {
                    await client.connectUser(
                        { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
                        tokenData.token
                    );
                }
                setChatClient(client);

                const filter = { members: { $in: [authUser._id] } };
                const sort = [{ last_message_at: -1 }];
                const fetchedChannels = await client.queryChannels(filter, sort, {
                    limit: 30, state: true, watch: false, presence: false,
                });
                setStreamChannels(fetchedChannels);
            } catch (err) {
                console.error("Error loading chats:", err);
            } finally {
                setStreamLoading(false);
            }
        };
        init();
    }, [tokenData, authUser]);

    // ── Stream helpers ──
    const getOtherMember = (channel) => {
        const members = Object.values(channel.state.members);
        return members.find((m) => m.user?.id !== authUser?._id)?.user;
    };

    const getLastMessage = (channel) => {
        const msg = channel.state.messages[channel.state.messages.length - 1];
        if (!msg) return "No messages yet";
        if (msg.attachments?.some((a) => a.type === "voice")) return "🎙️ Voice message";
        if (!msg.text) return "Attachment";
        const dec = decryptMessage(msg.text);
        return dec.length > 55 ? dec.slice(0, 55) + "…" : dec;
    };

    const formatTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const now = new Date();
        if (d.toDateString() === now.toDateString())
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
        const diff = Math.floor((now - d) / 86400000);
        if (diff === 1) return "Yesterday";
        if (diff < 7) return d.toLocaleDateString([], { weekday: "short" });
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    const openChat = (userId) => navigate(`/chat/${userId}`);

    // ── MongoDB helpers ──
    const getMongoOther = (conv) =>
        conv.participants?.find((p) => p._id !== authUser?._id);

    const getMongoPreview = (conv) => {
        if (!conv.lastMessage) return "No messages yet";
        if (conv.lastMessageType === "voice") return "🎙️ Voice message";
        if (conv.lastMessageType === "call") return "📞 Call";
        const dec = decryptMessage(conv.lastMessage);
        return dec.length > 55 ? dec.slice(0, 55) + "…" : dec;
    };

    // Filtered Stream channels
    const filteredStream = streamChannels.filter((ch) => {
        const other = getOtherMember(ch);
        return other?.name?.toLowerCase().includes(search.toLowerCase());
    });

    // Filtered MongoDB convos
    const filteredMongo = mongoConvos.filter((conv) => {
        const other = getMongoOther(conv);
        return other?.fullName?.toLowerCase().includes(search.toLowerCase());
    });

    const isLoading = activeTab === "recent" ? streamLoading : mongoLoading;
    const isEmpty = activeTab === "recent" ? filteredStream.length === 0 : filteredMongo.length === 0;

    return (
        <div className="h-full flex flex-col bg-base-100">
            {/* Header */}
            <div className="px-3 sm:px-4 pt-4 sm:pt-6 pb-3 border-b border-base-300">
                <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="size-6 text-primary" />
                    Chats
                </h1>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-3 w-fit">
                    <button
                        className={`tab tab-sm ${activeTab === "recent" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("recent")}
                    >
                        Recent
                    </button>
                    <button
                        className={`tab tab-sm flex items-center gap-1 ${activeTab === "mongo" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("mongo")}
                    >
                        <Database className="size-3" />
                        Saved
                    </button>
                </div>

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
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-primary" />
                    </div>
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 gap-3">
                        <MessageCircle className="size-12" />
                        <p className="text-lg font-medium">
                            {search ? "No results found" : "No conversations yet"}
                        </p>
                        {!search && (
                            <p className="text-sm">
                                Start chatting from the{" "}
                                <span className="text-primary cursor-pointer hover:underline" onClick={() => navigate("/")}>
                                    Home page
                                </span>
                            </p>
                        )}
                    </div>
                ) : activeTab === "recent" ? (
                    // ── Stream conversations ──
                    filteredStream.map((channel) => {
                        const other = getOtherMember(channel);
                        if (!other) return null;
                        const unread = channel.countUnread() || 0;
                        const lastMsg = channel.state.messages[channel.state.messages.length - 1];

                        return (
                            <button
                                key={channel.id}
                                onClick={() => openChat(other.id)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-base-200 transition-colors text-left"
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="avatar">
                                        <div className="w-12 h-12 rounded-full">
                                            <img
                                                src={other.image || `https://api.dicebear.com/7.x/initials/svg?seed=${other.name}`}
                                                alt={other.name}
                                                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${other.name}`; }}
                                            />
                                        </div>
                                    </div>
                                    {other.online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                                    )}
                                </div>
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
                ) : (
                    // ── MongoDB conversations ──
                    filteredMongo.map((conv) => {
                        const other = getMongoOther(conv);
                        if (!other) return null;

                        return (
                            <button
                                key={conv._id}
                                onClick={() => openChat(other._id)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-base-200 transition-colors text-left"
                            >
                                <div className="avatar flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full">
                                        <img
                                            src={other.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${other.fullName}`}
                                            alt={other.fullName}
                                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${other.fullName}`; }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-semibold truncate text-base-content/80">
                                            {other.fullName || "Unknown"}
                                        </span>
                                        <span className="text-xs opacity-50 flex-shrink-0 ml-2">
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm truncate opacity-60">{getMongoPreview(conv)}</p>
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
