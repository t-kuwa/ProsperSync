import React, { useMemo } from "react";
import type { AppRoute } from "../../../routes";
import { APP_ROUTES, matchAccountRoute } from "../../../routes";
import AccountSwitcher from "./AccountSwitcher";
import HaruveIcon from "./HaruveIcon";
import useAccountState from "../../accounts/hooks/useAccountState";
import type { AccountSummary } from "../../accounts/types";

const HomeIcon = () => (
  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
  </svg>
);

const ReceiptIcon = () => (
  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 9h6m-6 3h6m-6 3h6M6.996 9h.01m-.01 3h.01m-.01 3h.01M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M7.926 10.898 15 7.727m-7.074 5.39L15 16.29M8 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm12 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm0-11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
  </svg>
);

const MembersIcon = () => (
  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z" clip-rule="evenodd"/>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 5v14m7-7H5"
    />
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

const Sidebar = ({
  onLogout,
  currentRoute,
  onNavigate,
  variant = "desktop",
  onClose,
  isOpen = true,
}: SidebarProps) => {
  const baseClass =
    "flex flex-col bg-white px-6 py-8";
  const desktopClass = `${baseClass} w-full max-w-sm border-r border-slate-200 fixed inset-y-0 left-0 z-[60] hidden lg:flex h-screen`;
  const mobileClass = `${baseClass} w-[90%] max-w-sm border-l border-slate-200 fixed inset-y-0 right-0 z-[60] flex shadow-2xl shadow-slate-900/10 h-screen transition-transform duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
  }`;
  const { currentAccount, selectAccount } = useAccountState();

  const accountNavigation = useMemo<
    Array<{ label: string; icon: React.ReactNode; route: AppRoute }>
  >(() => {
    if (!currentAccount) {
      return [];
    }

    return [
      {
        label: "アカウント設定",
        icon: <SettingsIcon />,
        route: APP_ROUTES.accountSettings(currentAccount.id),
      },
      {
        label: "メンバー管理",
        icon: <MembersIcon />,
        route: APP_ROUTES.accountMembers(currentAccount.id),
      },
    ];
  }, [currentAccount]);

  const handleAccountSelect = (account: AccountSummary) => {
    selectAccount(account.id);
    const match = matchAccountRoute(currentRoute);

    if (match) {
      const nextRoute =
        match.type === "settings"
          ? APP_ROUTES.accountSettings(account.id)
          : APP_ROUTES.accountMembers(account.id);
      onNavigate(nextRoute);
      onClose?.();
      return;
    }

    onClose?.();
  };

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

      <div className="mb-8">
        <AccountSwitcher onSelect={handleAccountSelect} />
      </div>

      <nav className="flex flex-1 flex-col gap-6 text-sm font-medium">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            メイン
          </p>
          <ul className="space-y-1">
            {[
              { label: "ダッシュボード", icon: <HomeIcon />, route: APP_ROUTES.dashboard },
              { label: "トランザクション", icon: <ReceiptIcon />, route: APP_ROUTES.transactions },
            ].map((item) => {
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

        {accountNavigation.length ? (
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              アカウント管理
            </p>
            <ul className="space-y-1">
              {accountNavigation.map((item) => {
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
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(APP_ROUTES.accountCreate);
                    onClose?.();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 transition ${
                    currentRoute === APP_ROUTES.accountCreate
                      ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  <span className="text-lg text-indigo-500">
                    <PlusIcon />
                  </span>
                  新しいアカウントを作成
                </button>
              </li>
            </ul>
          </div>
        ) : null}
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
