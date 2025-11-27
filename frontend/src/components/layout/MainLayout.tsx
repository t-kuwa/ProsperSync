import React, { useState } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogout?: () => void;
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  userName,
  onLogout,
  onNavigate,
  currentPath = "/",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background font-sans text-text-primary relative">
      {/* AI Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-ai-mesh animate-mesh-flow bg-[length:200%_200%]" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px]" />
      </div>

      <div className="relative z-10 flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          userName={userName}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-between px-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-text-primary"
        >
          <span className="material-icons">menu</span>
        </button>
        <span className="text-lg font-semibold">Haruve</span>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute top-0 left-0 bottom-0 w-64 shadow-2xl transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            currentPath={currentPath}
            onNavigate={handleNavigate}
            userName={userName}
            onLogout={onLogout}
            className="h-full"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-0 pt-16 md:pt-0">
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>
      </div>
    </div>
  );
};
