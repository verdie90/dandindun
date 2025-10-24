"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopMenu } from "./AdminTopMenu";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { session } = useAuth();
  const { checkRole } = usePermission();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isAdmin = checkRole("admin");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (mounted && !session.isAuthenticated && !session.isLoading) {
      router.push("/auth/login");
    }
  }, [session.isAuthenticated, session.isLoading, router, mounted]);

  useEffect(() => {
    // Redirect if not admin
    if (mounted && !session.isLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, mounted, session.isLoading, router]);

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

  if (!mounted || session.isLoading) {
    return null;
  }

  if (!session.user || !isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Menu */}
      <AdminTopMenu
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
          <AdminSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div onClick={handleSidebarClose}>{children}</div>
        </main>
      </div>
    </div>
  );
}
