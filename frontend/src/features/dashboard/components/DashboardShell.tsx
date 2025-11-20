import { Fragment, useState, type ReactNode } from "react";
import { APP_ROUTES, type AppRoute } from "../../../routes";
import GlassPanel from "../../../components/ui/GlassPanel";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";

const QUICK_ACTIONS: Array<{ label: string; icon: string; route: AppRoute }> = [
  { label: "収支の登録", icon: "edit", route: APP_ROUTES.transactions },
  { label: "予算の調整", icon: "pie_chart", route: APP_ROUTES.budgets },
  { label: "アカウント作成", icon: "add", route: APP_ROUTES.accountCreate },
];

const greetingMessage = (userName?: string) => {
  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? "こんばんは"
      : hour < 12
        ? "おはようございます"
        : hour < 18
          ? "こんにちは"
          : "こんばんは";
  if (!userName) {
    return greeting;
  }
  return `${greeting}、${userName}さん`;
};

type DesktopHeroCardProps = {
  title: string;
  userName?: string;
  onNavigate: (route: AppRoute) => void;
};

const DesktopHeroCard = ({ title, userName, onNavigate }: DesktopHeroCardProps) => (
  <GlassPanel
    className="mb-8 hidden items-center justify-between gap-6 px-10 py-8 text-slate-900 lg:flex"
    interactive
  >
    <div>
      <p className="text-sm font-medium text-slate-500">{greetingMessage(userName)}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 text-base text-slate-500">
        ガラスのように滑らかな操作感と、Appleのダッシュボードを意識したシンプルな情報整理を提供します。
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => onNavigate(action.route)}
          className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
        >
          <span className="material-icons text-base">{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  </GlassPanel>
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
  <nav className="pointer-events-none lg:hidden" aria-label="メインナビゲーション">
    <div className="pointer-events-auto fixed inset-x-4 bottom-4 z-40 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onNavigate(APP_ROUTES.transactions)}
        className="flex items-center justify-center gap-2 rounded-3xl bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/30"
      >
        <span className="material-icons text-base text-white">add</span>
        クイック収支登録
      </button>
      <div className="rounded-[28px] border border-white/70 bg-white/80 px-3 py-2 shadow-floating backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active = currentRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => onNavigate(item.route)}
                className={`flex h-14 flex-1 flex-col items-center justify-center rounded-2xl text-[11px] font-semibold transition ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span className={`material-icons text-2xl ${active ? "text-indigo-600" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
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
    <div className="relative flex min-h-screen bg-transparent text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-emerald-100/40 blur-[150px]" />
      </div>
      <Sidebar
        variant="desktop"
        onLogout={onLogout}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
      />

      <Fragment>
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
      </Fragment>

      <div className="relative z-10 flex flex-1 flex-col lg:ml-24">
        <DashboardHeader
          userName={userName}
          title={headerTitle}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-32 pt-6 sm:px-6 lg:px-16">
          <DesktopHeroCard title={headerTitle} userName={userName} onNavigate={handleNavigate} />
          <div className="flex flex-1 flex-col gap-6">{children}</div>
        </main>
        <MobileBottomNav currentRoute={currentRoute} onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default DashboardShell;
