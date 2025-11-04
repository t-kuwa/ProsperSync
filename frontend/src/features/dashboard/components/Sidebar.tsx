import type { AppRoute } from "../../../routes";
import React from "react";
import HaruveIcon from "./HaruveIcon";

const HomeIcon = () => (
  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
  </svg>
);

const ReceiptIcon = () => (
  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 3v4a1 1 0 0 0 1 1h4M6 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1M6 3v4a1 1 0 0 1-1 1H3m12 7h-6m3 3h-3"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 9a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/>
  </svg>
);

type SidebarProps = {
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  variant?: "desktop" | "mobile";
  onClose?: () => void;
  isOpen?: boolean;
};

const mainNavigation: Array<{
  label: string;
  icon: React.ReactNode;
  route: AppRoute;
}> = [
  { label: "ダッシュボード", icon: <HomeIcon />, route: "/dashboard" },
  { label: "トランザクション", icon: <ReceiptIcon />, route: "/transactions" },
];

const secondaryNavigation: Array<{
  label: string;
  icon: React.ReactNode;
}> = [
  { label: "アカウント", icon: <UserIcon /> },  
];
const Sidebar = ({
  onLogout,
  currentRoute,
  onNavigate,
  variant = "desktop",
  onClose,
  isOpen = true,
}: SidebarProps) => {
  const baseClass =
    "flex w-64 flex-col bg-white px-6 py-8";
  const desktopClass = `${baseClass} border-r border-slate-200 fixed inset-y-0 left-0 z-[60] hidden lg:flex h-screen`;
  const mobileClass = `${baseClass} border-l border-slate-200 fixed inset-y-0 right-0 z-[60] flex shadow-2xl shadow-slate-900/10 h-screen transition-transform duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
  }`;

  return (
    <aside className={`${variant === "desktop" ? desktopClass : mobileClass} overflow-y-auto`}>
      <div className="mb-12 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HaruveIcon className="h-10 w-10" />
          <p className="text-lg font-semibold text-slate-900">Haruve</p>
        </div>
        {variant === "mobile" ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-6 text-sm font-medium">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            メイン
          </p>
          <ul className="space-y-1">
            {mainNavigation.map((item) => {
              const active = currentRoute === item.route;
              return (
                <li key={item.route}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.route);
                      onClose?.();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 transition ${
                      active
                        ? "bg-slate-900/90 text-white shadow-sm shadow-indigo-200"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            その他
          </p>
          <ul className="space-y-1">
            {secondaryNavigation.map((item) => (
              <li key={item.label}>
                <span className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2 text-slate-500 transition hover:bg-slate-100">
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {onLogout ? (
        <button
          type="button"
          onClick={() => {
            onLogout();
            onClose?.();
          }}
          className="mt-8 flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          ログアウト
        </button>
      ) : null}
    </aside>
  );
};

export default Sidebar;
