import { VideoIcon, PhoneIcon } from "lucide-react";

function CallButton({ handleVideoCall, handleAudioCall }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleAudioCall}
        className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary"
        title="Voice Call"
      >
        <PhoneIcon className="size-5" />
      </button>
      <button
        onClick={handleVideoCall}
        className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-primary"
        title="Video Call"
      >
        <VideoIcon className="size-5" />
      </button>
    </div>
  );
}

export default CallButton;