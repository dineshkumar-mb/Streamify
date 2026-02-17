import { useState, useRef } from "react";
import { Mic, Square, Trash, Send } from "lucide-react";
import { useChannelActionContext } from "stream-chat-react";
import toast from "react-hot-toast";

const VoiceRecorder = ({ onSendVoice }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSend = () => {
        if (audioBlob) {
            onSendVoice(audioBlob);
            setAudioBlob(null);
        }
    };

    const handleDiscard = () => {
        setAudioBlob(null);
    };

    return (
        <div className="flex items-center">
            {isRecording ? (
                <div className="flex items-center gap-2 bg-error/10 px-3 py-1.5 rounded-full animate-in slide-in-from-left duration-300">
                    <div className="size-2 bg-error rounded-full animate-pulse" />
                    <span className="text-[11px] font-bold text-error tabular-nums">REC</span>
                    <button onClick={stopRecording} className="btn btn-ghost btn-circle btn-xs text-error">
                        <Square className="size-4" />
                    </button>
                </div>
            ) : audioBlob ? (
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full animate-in zoom-in duration-200">
                    <button onClick={handleDiscard} className="btn btn-ghost btn-circle btn-xs text-error">
                        <Trash className="size-4" />
                    </button>
                    <button onClick={handleSend} className="btn btn-primary btn-circle btn-xs">
                        <Send className="size-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={startRecording}
                    className="btn btn-ghost btn-circle btn-sm text-[#075e54] hover:bg-base-200"
                    title="Voice Message"
                >
                    <Mic className="size-5" />
                </button>
            )}
        </div>
    );
};

export default VoiceRecorder;
