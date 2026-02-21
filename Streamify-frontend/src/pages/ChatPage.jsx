import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, saveMessage } from "../lib/api";
import { Lock } from "lucide-react";

import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import CustomMessage from "../components/CustomMessage";
import WhatsAppHeader from "../components/WhatsAppHeader";
import VoiceRecorder from "../components/VoiceRecorder";
import { encryptMessage } from "../lib/encryption";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  // ── Persist a message to MongoDB silently (fire-and-forget) ──
  const persistToMongo = async ({ content, messageType = "text", streamMsgId }) => {
    try {
      await saveMessage({
        receiverId: targetUserId,
        content,
        messageType,
        streamMsgId,
      });
    } catch (err) {
      // Non-blocking — Stream has the message even if MongoDB save fails
      console.warn("MongoDB message save failed (non-critical):", err.message);
    }
  };

  const handleAudioCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}?type=audio`;
      const callText = `Incoming audio call... Join here: ${callUrl}`;
      const encrypted = encryptMessage(callText);

      try {
        const res = await channel.sendMessage({
          text: encrypted,
          call_link: callUrl,
          call_type: "audio",
        });
        await persistToMongo({
          content: encrypted,
          messageType: "call",
          streamMsgId: res.message?.id,
        });
        toast.success("Initiating audio call...");
        navigate(`/call/${channel.id}?type=audio`);
      } catch (error) {
        console.error("Error starting call:", error);
        toast.error("Failed to start call");
      }
    }
  };

  const handleVideoCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}?type=video`;
      const callText = `Incoming video call... Join here: ${callUrl}`;
      const encrypted = encryptMessage(callText);

      try {
        const res = await channel.sendMessage({
          text: encrypted,
          call_link: callUrl,
          call_type: "video",
        });
        await persistToMongo({
          content: encrypted,
          messageType: "call",
          streamMsgId: res.message?.id,
        });
        toast.success("Initiating video call...");
        navigate(`/call/${channel.id}?type=video`);
      } catch (error) {
        console.error("Error starting call:", error);
        toast.error("Failed to start call");
      }
    }
  };

  // Override Stream's submit: encrypt → send to Stream → persist to MongoDB
  const overrideSubmitHandler = async (message) => {
    const encrypted = encryptMessage(message.text);
    const overridden = { ...message, text: encrypted };

    try {
      const res = await channel.sendMessage(overridden);
      await persistToMongo({
        content: encrypted,
        messageType: "text",
        streamMsgId: res.message?.id,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleSendVoice = async (blob) => {
    if (!channel) return;

    try {
      const filename = `voice_${Date.now()}.webm`;
      const file = new File([blob], filename, { type: "audio/webm" });
      const response = await channel.sendFile(file);

      const encrypted = encryptMessage("Sent a voice message");
      const res = await channel.sendMessage({
        text: encrypted,
        attachments: [
          {
            type: "voice",
            asset_url: response.file,
            file_size: file.size,
            mime_type: file.type,
            title: filename,
          },
        ],
      });

      await persistToMongo({
        content: response.file, // store the voice URL as content
        messageType: "voice",
        streamMsgId: res.message?.id,
      });

      toast.success("Voice message sent!");
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast.error("Failed to send voice message.");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-full flex flex-col bg-[#e5ddd5]">
      <Chat client={chatClient} theme="messaging light">
        <Channel
          channel={channel}
          Message={CustomMessage}
          TypingIndicator={() => null}
          enableMessagesPositionRendering={true}
        >
          <div className="w-full relative flex-1 flex flex-col h-full bg-transparent">
            <Window>
              <WhatsAppHeader>
                <CallButton handleVideoCall={handleVideoCall} handleAudioCall={handleAudioCall} />
              </WhatsAppHeader>

              <div className="bg-warning/10 py-1.5 px-4 flex items-center justify-center gap-2 border-b border-warning/20">
                <Lock className="size-3 text-warning" />
                <span className="text-[10px] sm:text-xs opacity-70">
                  Messages are end-to-end encrypted. No one outside of this chat can read them.
                </span>
              </div>

              <MessageList Message={CustomMessage} />

              <div className="flex items-end gap-2 px-2 sm:px-3 py-2 bg-transparent sticky bottom-0">
                <div className="flex-1 flex items-center bg-base-100 rounded-[24px] px-2 py-1 shadow-sm border border-base-300/50">
                  <MessageInput
                    focus
                    grow
                    overrideSubmitHandler={overrideSubmitHandler}
                  />
                </div>
                <div className="mb-0.5">
                  <VoiceRecorder onSendVoice={handleSendVoice} />
                </div>
              </div>
            </Window>
          </div>
          <Thread Message={CustomMessage} />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;
