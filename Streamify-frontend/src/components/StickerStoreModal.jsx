import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStickers, downloadStickerPack, removeStickerPack } from "../lib/api";
import toast from "react-hot-toast";

const StickerStoreModal = ({ onClose }) => {
    const queryClient = useQueryClient();
    const [selectedPack, setSelectedPack] = useState(null);

    const { data: stickerPacks, isLoading } = useQuery({
        queryKey: ["stickers"],
        queryFn: getStickers,
    });

    const { mutate: downloadMutate, isPending: downloading } = useMutation({
        mutationFn: downloadStickerPack,
        onSuccess: () => {
            toast.success("Sticker pack downloaded!");
            queryClient.invalidateQueries({ queryKey: ["stickers"] });
            // update authUser downloadedStickers so the chat picker reflects truth immediately
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: () => toast.error("Failed to download pack"),
    });

    const { mutate: removeMutate, isPending: removing } = useMutation({
        mutationFn: removeStickerPack,
        onSuccess: () => {
            toast.success("Sticker pack removed!");
            queryClient.invalidateQueries({ queryKey: ["stickers"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: () => toast.error("Failed to remove pack"),
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-base-300 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Sticker Store</h2>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4">
                    {/* List of packages */}
                    <div className="w-full md:w-1/3 flex flex-col gap-2 border-r border-base-300 pr-2">
                        {isLoading ? (
                            <span className="loading loading-spinner loading-md mx-auto my-4" />
                        ) : stickerPacks?.length === 0 ? (
                            <p className="text-sm opacity-50">No packs available.</p>
                        ) : (
                            stickerPacks?.map((pack) => (
                                <div
                                    key={pack.id}
                                    onClick={() => setSelectedPack(pack)}
                                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${selectedPack?.id === pack.id ? "bg-primary/20" : "hover:bg-base-200"
                                        }`}
                                >
                                    <img src={pack.thumbnail} alt={pack.name} className="w-10 h-10 object-contain" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm truncate">{pack.name}</span>
                                        {pack.isDownloaded && (
                                            <span className="text-[10px] text-success font-bold">Downloaded</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Details / Preview */}
                    <div className="w-full md:w-2/3 flex flex-col relative min-h-[300px]">
                        {selectedPack ? (
                            <div className="animate-in fade-in zoom-in duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold">{selectedPack.name}</h3>
                                    {selectedPack.isDownloaded ? (
                                        <button
                                            className="btn btn-sm btn-error btn-outline"
                                            onClick={() => removeMutate(selectedPack.id)}
                                            disabled={removing}
                                        >
                                            {removing ? "Removing..." : "Remove"}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => downloadMutate(selectedPack.id)}
                                            disabled={downloading}
                                        >
                                            {downloading ? "Downloading..." : "Download"}
                                        </button>
                                    )}
                                </div>

                                <h4 className="text-sm font-semibold mb-2 opacity-70">Preview</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {selectedPack.stickers.map((stickerUrl, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square bg-base-200 rounded p-2 flex items-center justify-center hover:bg-base-300 transition-colors"
                                        >
                                            <img src={stickerUrl} alt="Sticker Preview" className="w-full h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm opacity-50">
                                Select a sticker pack to preview.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StickerStoreModal;
