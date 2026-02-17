import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { Users } from "lucide-react";
import CreateGroupModal from "../components/CreateGroupModal";
import { useState } from "react";
import { StreamChat } from "stream-chat";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const FriendsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { authUser } = useAuthUser();

    const { data: friends = [], isLoading } = useQuery({
        queryKey: ["friends"],
        queryFn: getUserFriends,
    });

    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    if (isLoading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;

    const chatClient = tokenData?.token ? StreamChat.getInstance(STREAM_API_KEY) : null;
    if (chatClient && authUser) {
        chatClient.connectUser({
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic
        }, tokenData.token);
    }

    return (
        <div className="h-full bg-base-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Friends</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary gap-2"
                    >
                        <Users className="size-5" />
                        New Group
                    </button>
                </div>

                <CreateGroupModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    client={chatClient}
                />

                {friends.length === 0 ? (
                    <NoFriendsFound />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {friends.map((friend) => (
                            <FriendCard key={friend._id} friend={friend} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsPage;
