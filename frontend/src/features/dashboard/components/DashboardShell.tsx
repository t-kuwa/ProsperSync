import { useState, type ReactNode } from "react";
import type { AppRoute } from "../../../routes";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";

type DesktopHeroCardProps = {
  title: string;
};

const DesktopHeroCard = ({ title }: DesktopHeroCardProps) => (
  <div className="relative mb-8 hidden overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 text-slate-900 shadow-lg shadow-slate-900/5 ring-1 ring-white/60 lg:block">
    <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/30 blur-3xl" />
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
    </div>
  </div>
);

type DashboardShellProps = {
  userName?: string;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  headerTitle: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

const DashboardShell = ({
  userName,
  onLogout,
  currentRoute,
  onNavigate,
  headerTitle,
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

      <div className="flex flex-1 flex-col lg:ml-24">
        <DashboardHeader
          userName={userName}
          title={headerTitle}
          actions={headerActions}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="max-w-[100vw] flex-1 px-4 pb-6 pt-6 sm:px-6 lg:px-12">
          <DesktopHeroCard title={headerTitle} />
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
