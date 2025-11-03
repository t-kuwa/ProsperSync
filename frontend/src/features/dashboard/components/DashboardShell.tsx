import { useState, type ReactNode } from "react";
import type { AppRoute } from "../../../routes";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";

type DashboardShellProps = {
  userName?: string;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  headerTitle: string;
  headerSubtitle?: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

const DashboardShell = ({
  userName,
  onLogout,
  currentRoute,
  onNavigate,
  headerTitle,
  headerSubtitle,
  headerActions,
  children,
}: DashboardShellProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNavigate = (route: AppRoute) => {
    onNavigate(route);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <Sidebar
        variant="desktop"
        onLogout={onLogout}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
      />

      <>
        <div
          role="presentation"
          className={`fixed inset-0 z-[59] bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            mobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileSidebarOpen(false)}
        />
        <Sidebar
          variant="mobile"
          onLogout={onLogout}
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onClose={() => setMobileSidebarOpen(false)}
          isOpen={mobileSidebarOpen}
        />
      </>

      <div className="flex flex-1 flex-col lg:ml-64">
        <DashboardHeader
          userName={userName}
          title={headerTitle}
          subtitle={headerSubtitle}
          actions={headerActions}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 px-4 pb-6 pt-6 sm:px-6 lg:px-12">{children}</main>
      </div>
    </div>
  );
};

export default DashboardShell;
