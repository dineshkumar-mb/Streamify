import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* DESKTOP SIDEBAR - Hidden on mobile, visible on lg */}
        {showSidebar && (
          <div className="hidden lg:flex flex-col w-64 shrink-0 transition-all duration-300 border-r border-base-300 h-screen sticky top-0 bg-base-200">
            <Sidebar />
          </div>
        )}

        {/* MOBILE SIDEBAR - Drawer pattern */}
        {showSidebar && isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar Content */}
            <div className="relative w-64 bg-base-200 h-full shadow-xl transition-transform transform duration-300 ease-in-out">
              <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto w-full">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;