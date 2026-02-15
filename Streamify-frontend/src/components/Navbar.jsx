import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, LogOutIcon, Menu, ShipWheelIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = ({ onOpenSidebar }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

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
            {!isChatPage && (
              <button
                className="btn btn-ghost btn-circle lg:hidden"
                onClick={onOpenSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            {/* LOGO - ONLY IN THE CHAT PAGE AND MOBILE HOME */}
            {isChatPage && (
              <div className="pl-0 sm:pl-5">
                <Link to="/" className="flex items-center gap-2.5">
                  <ShipWheelIcon className="size-8 sm:size-9 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                    Streamify
                  </span>
                </Link>
              </div>
            )}

            {/* Show Logo on mobile if not on chat page (since Sidebar is hidden) */}
            {!isChatPage && (
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
            <Link to={"/"} className="hidden sm:inline-block">
              <button className="btn btn-ghost btn-circle">
                <HomeIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <Link to={"/notifications"} className="hidden sm:inline-block">
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>

            {/* TODO */}
            <ThemeSelector />

            <div className="avatar">
              <div className="w-9 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
              </div>
            </div>

            {/* Logout button */}
            <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;