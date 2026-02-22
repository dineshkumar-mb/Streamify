import { useState, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStickers } from "../lib/api";
import { SearchContextManager, SearchContext, SearchBar, Grid } from "@giphy/react-components";

// Giphy Grid Renderer
const StickersGrid = ({ onSelectSticker }) => {
    const { fetchGifs, searchKey } = useContext(SearchContext);

    return (
        <Grid
            key={searchKey}
            columns={3}
            width={300}
            fetchGifs={fetchGifs}
            onGifClick={(gif, e) => {
                e.preventDefault();
                onSelectSticker(gif.images.fixed_height.url);
            }}
            noLink
        />
    );
};

const StickerPicker = ({ onSelectSticker }) => {
    const [mode, setMode] = useState("giphy"); // "giphy" or "saved"
    const [activeTab, setActiveTab] = useState(0);

    // Fetch saved stickers configured from Sticker Store
    const { data: stickerPacks, isLoading } = useQuery({
        queryKey: ["stickers"],
        queryFn: getStickers,
    });

    const downloadedPacks = stickerPacks?.filter((p) => p.isDownloaded) || [];
    const activePack = downloadedPacks[activeTab];
    const apiKey = import.meta.env.VITE_GIPHY_API_KEY || "GlVGYHqc3SyCEGqmeJhNaLuw18L0V3v2";

    return (
        <div className="flex flex-col h-[350px] w-80 bg-base-100 rounded-lg shadow-xl border border-base-300 overflow-hidden">
            {/* Mode Switcher */}
            <div className="flex bg-base-200 border-b border-base-300 text-xs font-semibold shrink-0">
                <button
                    onClick={() => setMode("giphy")}
                    className={`flex-1 py-2 text-center transition-colors ${mode === "giphy" ? "bg-base-100 border-b-2 border-primary text-primary" : "opacity-70 hover:bg-base-300"}`}
                >
                    Giphy Search
                </button>
                <button
                    onClick={() => setMode("saved")}
                    className={`flex-1 py-2 text-center transition-colors ${mode === "saved" ? "bg-base-100 border-b-2 border-primary text-primary" : "opacity-70 hover:bg-base-300"}`}
                >
                    Store Packs
                </button>
            </div>

            {/* Giphy Mode */}
            {mode === "giphy" && (
                <SearchContextManager apiKey={apiKey} options={{ type: "stickers", limit: 30 }}>
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-2 border-b border-base-300 shrink-0 bg-base-200">
                            <SearchBar autoFocus placeholder="Search dynamic stickers..." />
                        </div>
                        <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                            <StickersGrid onSelectSticker={onSelectSticker} />
                        </div>
                    </div>
                </SearchContextManager>
            )}

            {/* Saved Packs Mode */}
            {mode === "saved" && (
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Scrollable Tabs */}
                    <div className="flex overflow-x-auto bg-base-100 border-b border-base-300 p-1 no-scrollbar shrink-0 h-[45px]">
                        {downloadedPacks.map((pack, index) => (
                            <button
                                key={pack.id}
                                onClick={() => setActiveTab(index)}
                                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${activeTab === index ? "bg-base-300 shadow-sm" : "hover:bg-base-200"
                                    }`}
                                title={pack.name}
                            >
                                <img src={pack.thumbnail} alt="Tab" className="w-6 h-6 object-contain" />
                            </button>
                        ))}
                        {downloadedPacks.length === 0 && (
                            <div className="text-xs opacity-50 p-2 italic flex items-center h-full">Visit Store to claim packs!</div>
                        )}
                    </div>

                    {/* Grid Content */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {isLoading ? (
                            <div className="text-center opacity-50 text-sm mt-4">Loading...</div>
                        ) : activePack ? (
                            <div className="grid grid-cols-4 gap-2">
                                {activePack.stickers.map((url, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onSelectSticker(url)}
                                        className="aspect-square p-1 rounded hover:bg-base-200 transition-colors flex items-center justify-center cursor-pointer"
                                    >
                                        <img src={url} alt="Sticker" className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StickerPicker;
