import { useState, type ReactNode } from "react";
import { APP_ROUTES, type AppRoute } from "../../../routes";
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

const MOBILE_NAV_ITEMS: Array<{ label: string; icon: string; route: AppRoute }> = [
  { label: "ホーム", icon: "home", route: APP_ROUTES.dashboard },
  { label: "収支", icon: "receipt_long", route: APP_ROUTES.transactions },
  { label: "予算", icon: "pie_chart", route: APP_ROUTES.budgets },
];

type MobileBottomNavProps = {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const MobileBottomNav = ({ currentRoute, onNavigate }: MobileBottomNavProps) => (
  <nav className="pointer-events-none lg:hidden">
    <div className="pointer-events-auto fixed inset-x-4 bottom-4 z-40 rounded-full border border-white/70 bg-gradient-to-r from-white via-slate-50 to-slate-100 px-3 py-2 shadow-xl shadow-slate-900/10 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = currentRoute === item.route;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`flex h-12 w-full flex-1 items-center justify-center rounded-2xl transition ${
                active ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className={`material-icons text-2xl ${active ? "text-indigo-600" : "text-slate-400"}`}>
                {item.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

type DashboardShellProps = {
  userName?: string;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  headerTitle: string;
  children: ReactNode;
};

const DashboardShell = ({
  userName,
  onLogout,
  currentRoute,
  onNavigate,
  headerTitle,
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
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="max-w-[100vw] flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-12 lg:pb-6">
          <DesktopHeroCard title={headerTitle} />
          {children}
        </main>
        <MobileBottomNav currentRoute={currentRoute} onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default DashboardShell;
