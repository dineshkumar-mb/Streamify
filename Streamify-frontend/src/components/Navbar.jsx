import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, LogOutIcon, Menu, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import StickerStoreModal from "./StickerStoreModal";
import useLogout from "../hooks/useLogout";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const Navbar = ({ onOpenSidebar }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isSingleChatPage = location.pathname?.startsWith("/chat/");
  const { t } = useTranslation();
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Mobile Menu Button - Left Side */}
          <div className="flex items-center gap-4">
            {!isSingleChatPage && (
              <button
                className="btn btn-ghost btn-circle lg:hidden"
                onClick={onOpenSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            {/* LOGO - ONLY IN THE SINGLE CHAT PAGE AND MOBILE HOME */}
            {isSingleChatPage && (
              <div className="pl-0 sm:pl-5">
                <Link to="/" className="flex items-center gap-2.5">
                  <ShipWheelIcon className="size-8 sm:size-9 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                    Streamify
                  </span>
                </Link>
              </div>
            )}

            {/* Show Logo on mobile if not on single chat page (since Sidebar is hidden on mobile) */}
            {!isSingleChatPage && (
              <div className="lg:hidden">
                <Link to="/" className="flex items-center gap-2">
                  <ShipWheelIcon className="size-6 text-primary" />
                  <span className="text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                    Streamify
                  </span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="tooltip tooltip-bottom" data-tip={t("navbar.home")}>
              <Link to={"/"} className="hidden sm:inline-block">
                <button className="btn btn-ghost btn-circle">
                  <HomeIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </Link>
            </div>

            <div className="tooltip tooltip-bottom" data-tip={t("navbar.notifications")}>
              <Link to={"/notifications"} className="hidden sm:inline-block">
                <button className="btn btn-ghost btn-circle">
                  <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </Link>
            </div>

            {/* Store */}
            <div className="tooltip tooltip-bottom" data-tip="Sticker Store">
              <button className="btn btn-ghost btn-circle text-primary" onClick={() => setIsStoreOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </button>
            </div>

            <LanguageSelector />
            <ThemeSelector />

            <div className="avatar">
              <div className="w-9 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </div>
            </div>

            {/* Logout button */}
            <div className="tooltip tooltip-bottom" data-tip={t("navbar.logout")}>
              <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
                <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isStoreOpen && <StickerStoreModal onClose={() => setIsStoreOpen(false)} />}
    </nav>
  );
};
export default Navbar;