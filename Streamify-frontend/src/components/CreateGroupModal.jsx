import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { Users, X, Plus } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupModal = ({ isOpen, onClose, client }) => {
    const [groupName, setGroupName] = useState("");
    const [selectedFriends, setSelectedFriends] = useState([]);

    const { data: friends = [] } = useQuery({
        queryKey: ["friends"],
        queryFn: getUserFriends,
        enabled: isOpen,
    });

    const toggleFriend = (id) => {
        setSelectedFriends((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return toast.error("Please enter a group name");
        if (selectedFriends.length < 2) return toast.error("Select at least 2 friends for a group");

        try {
            const channelId = `group_${Date.now()}`;
            const members = [...selectedFriends, client.userID];

            const channel = client.channel("messaging", channelId, {
                name: groupName,
                members: members,
                created_by_id: client.userID,
            });

            await channel.create();
            toast.success(`Group "${groupName}" created!`);
            onClose();
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("Failed to create group.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200">
                    <div className="flex items-center gap-2">
                        <Users className="size-5 text-primary" />
                        <h2 className="font-bold">New Group</h2>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
                        <X className="size-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="form-control">
                        <label className="label text-xs font-bold opacity-60 uppercase">Group Name</label>
                        <input
                            type="text"
                            placeholder="Enter group name..."
                            className="input input-bordered w-full"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="label text-xs font-bold opacity-60 uppercase">Select Friends</label>
                        <div className="max-h-60 overflow-y-auto space-y-2 mt-2 pr-1 custom-scrollbar">
                            {friends.map((friend) => (
                                <div
                                    key={friend._id}
                                    className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${selectedFriends.includes(friend._id) ? "bg-primary/10 border-primary" : "bg-base-200 border-transparent hover:border-base-300"
                                        }`}
                                    onClick={() => toggleFriend(friend._id)}
                                >
                                    <div className="avatar size-8">
                                        <img src={friend.profilePic} alt={friend.fullName} className="rounded-full" />
                                    </div>
                                    <span className="flex-1 text-sm font-medium">{friend.fullName}</span>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm"
                                        checked={selectedFriends.includes(friend._id)}
                                        readOnly
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-base-200 border-t border-base-300">
                    <button
                        onClick={handleCreateGroup}
                        className="btn btn-primary w-full gap-2"
                        disabled={selectedFriends.length < 2 || !groupName.trim()}
                    >
                        <Plus className="size-5" />
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
