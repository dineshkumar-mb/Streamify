import { LoaderIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useState, useEffect } from "react";

const PageLoader = () => {
  const { theme } = useThemeStore();
  const [showWakeupMessage, setShowWakeupMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWakeupMessage(true);
    }, 3000); // Show message after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" data-theme={theme}>
      <LoaderIcon className="animate-spin size-10 text-primary" />
      {showWakeupMessage && (
        <div className="text-center animate-pulse">
          <p className="font-semibold text-lg">Waking up server...</p>
          <p className="text-sm text-base-content/70">
            This may take 30-50s on the first load due to free tier hosting.
          </p>
        </div>
      )}
    </div>
  );
};
export default PageLoader;