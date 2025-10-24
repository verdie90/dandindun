"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopMenu } from "./TopMenu";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Menu */}
      <TopMenu
        onMenuToggle={handleMenuToggle}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleSidebarClose}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col w-64 border-r bg-background transition-transform duration-300 ease-in-out",
            isMobile
              ? cn(
                  "fixed h-screen left-0 top-14 z-50 -translate-x-full",
                  isSidebarOpen && "translate-x-0"
                )
              : ""
          )}
        >
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div onClick={handleSidebarClose}>{children}</div>
        </main>
      </div>
    </div>
  );
}
