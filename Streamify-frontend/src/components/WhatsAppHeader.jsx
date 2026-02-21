import { useChannelStateContext, useTypingContext, useChatContext } from "stream-chat-react";

const WhatsAppHeader = ({ children }) => {
    const { channel } = useChannelStateContext();
    const { client } = useChatContext();
    const { typing } = useTypingContext();

    if (!channel || !client) return <div className="p-4 border-b bg-base-100">Loading...</div>;

    const members = Object.values(channel.state.members || {});
    const otherMember = members.find((m) => m.user.id !== client.userID);

    if (!otherMember) return <div className="p-4 border-b">Chat</div>;

    const { user } = otherMember;

    const getStatus = () => {
        const typingUsers = Object.values(typing);
        const isTyping = typingUsers.some((t) => t.user.id === user.id);

        if (isTyping) return "typing...";

        if (user.online) return "Online";

        if (user.last_active) {
            const lastActive = new Date(user.last_active);
            return `Last seen ${lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        return "Offline";
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-base-100 border-b border-base-300 sticky top-0 z-20">
            <div className="flex-1 flex items-center gap-3">
                <div className="avatar">
                    <div className="w-10 rounded-full relative">
                        <img src={user.image} alt={user.name} />
                        {user.online && (
                            <span className="absolute bottom-0 right-0 size-2.5 bg-success rounded-full border-2 border-base-100" />
                        )}
                    </div>
                </div>
                <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-sm leading-tight truncate">{user.name}</h3>
                    <p className={`text-[11px] ${getStatus() === "typing..." ? "text-primary font-medium" : "opacity-60"}`}>
                        {getStatus()}
                    </p>
                </div>
            </div>
            {children}
        </div>
    );
};

export default WhatsAppHeader;
