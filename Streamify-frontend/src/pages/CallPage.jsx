import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, submitCallRating } from "../lib/api";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import CallRatingModal from "../components/CallRatingModal";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    let activeCall;

    const initCall = async () => {
      if (!authUser || !tokenData?.token) return;

      try {
        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token: tokenData.token,
        });

        const urlParams = new URLSearchParams(window.location.search);
        const callType = urlParams.get("type") || "video";

        const newCall = videoClient.call("default", callId);
        await newCall.join({ create: true });

        if (callType === "audio") {
          await newCall.camera.disable();
        }

        activeCall = newCall;
        setClient(videoClient);
        setCall(newCall);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      if (activeCall) {
        activeCall.leave();
      }
    };
  }, [callId, authUser, tokenData?.token]);

  if (isLoading || isConnecting) return <PageLoader />;

  if (!client || !call) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        <p>Initializing call...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallContent call={call} />
      </StreamCall>
    </StreamVideo>
  );
};

// ─── Inner component — has access to Stream call state hooks ───

const CallContent = ({ call }) => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const [showRating, setShowRating] = useState(false);
  const [ratedUser, setRatedUser] = useState(null);
  // useRef to snapshot participants list before call ends — participants may be empty on LEFT
  const participantsSnap = useState(() => [])[0];
  useEffect(() => {
    if (participants.length > 0) {
      participantsSnap.splice(0, participantsSnap.length, ...participants);
    }
  }, [participants]); // eslint-disable-line

  const callId = call?.id;
  const callType = new URLSearchParams(window.location.search).get("type") || "video";
  const isAudioCall = callType === "audio";

  // When call leaves, show rating instead of immediately navigating
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      // Use snapshot because live participants list may be empty by the time LEFT fires
      const other = participantsSnap.find((p) => p.userId !== authUser?._id);
      if (other) {
        setRatedUser({
          id: other.userId,
          name: other.name || "Your partner",
          image: other.image,
        });
        setShowRating(true);
      } else {
        navigate("/");
      }
    }
  }, [callingState]); // eslint-disable-line

  const handleRatingSubmit = async (stars) => {
    if (!ratedUser) return;
    try {
      await submitCallRating({
        callId,
        ratedUserId: ratedUser.id,
        rating: stars,
        callType,
      });
      toast.success("Thanks for your rating! ⭐");
    } catch (err) {
      console.error("Rating submit failed:", err);
      toast.error("Could not save rating, but that's okay!");
    } finally {
      navigate("/");
    }
  };

  const handleSkip = () => {
    navigate("/");
  };

  // Show rating modal after call ends
  if (showRating) {
    return (
      <div className="h-screen bg-black">
        <CallRatingModal
          callId={callId}
          callType={callType}
          ratedUser={ratedUser}
          onSubmit={handleRatingSubmit}
          onSkip={handleSkip}
        />
      </div>
    );
  }

  return (
    <StreamTheme>
      <div className="h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
        {isAudioCall && (
          <div className="absolute top-24 flex flex-col items-center z-10 pointer-events-none">
            <div className="avatar mb-4">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300">
                <img src={authUser?.profilePic} alt="Calling" className="animate-pulse" />
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold">Voice Call</h2>
            <p className="text-white/60 text-sm">Active</p>
          </div>
        )}
        <SpeakerLayout />
        <div className="pb-10">
          <CallControls onLeave={() => call.leave()} />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;