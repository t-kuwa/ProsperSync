import React, { useMemo } from "react";
import type { AppRoute } from "../../../routes";
import { APP_ROUTES, matchAccountRoute } from "../../../routes";
import AccountSwitcher from "./AccountSwitcher";
import HaruveIcon from "./HaruveIcon";
import useAccountState from "../../accounts/hooks/useAccountState";
import type { AccountSummary } from "../../accounts/types";

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
    Array<{ label: string; icon: string; route: AppRoute }>
  >(() => {
    if (!currentAccount) {
      return [];
    }

    return [
      {
        label: "アカウント設定",
        icon: "settings",
        route: APP_ROUTES.accountSettings(currentAccount.id),
      },
      {
        label: "メンバー管理",
        icon: "people",
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
            <span className="material-icons text-lg">close</span>
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
              { label: "ダッシュボード", icon: "home", route: APP_ROUTES.dashboard },
              { label: "トランザクション", icon: "receipt", route: APP_ROUTES.transactions },
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
                    <span className="material-icons text-lg">{item.icon}</span>
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
                      <span className="material-icons text-lg">{item.icon}</span>
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
                  <span className="material-icons text-lg text-indigo-500">add</span>
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
