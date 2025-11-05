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
  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 3v4a1 1 0 0 0 1 1h4M6 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1M6 3v4a1 1 0 0 1-1 1H3m12 7h-6m3 3h-3"/>
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M10 4h4m-4 14h4m-2-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7-2.004-1.104-.17a1 1 0 0 1-.83-.83l-.17-1.104a1 1 0 0 0-.985-.846H14m-4 0H5.089a1 1 0 0 0-.985.846L3.934 11.33a1 1 0 0 1-.83.83L2 12.33m20 0-1.104-.17a1 1 0 0 1-.83-.83l-.17-1.104a1 1 0 0 0-.985-.846H14"
    />
  </svg>
);

const MembersIcon = () => (
  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3.05 18.36A10 10 0 0 1 12 14a10 10 0 0 1 8.95 4.36"
    />
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
    "flex w-64 flex-col bg-white px-6 py-8";
  const desktopClass = `${baseClass} border-r border-slate-200 fixed inset-y-0 left-0 z-[60] hidden lg:flex h-screen`;
  const mobileClass = `${baseClass} border-l border-slate-200 fixed inset-y-0 right-0 z-[60] flex shadow-2xl shadow-slate-900/10 h-screen transition-transform duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
  }`;
  const { accounts, currentAccount, selectAccount } = useAccountState();

  const personalAccount = useMemo(
    () => accounts.find((account) => account.accountType === "personal"),
    [accounts],
  );

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

        {personalAccount ? (
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
              ワークスペース
            </p>
            <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-100 shadow-sm shadow-slate-900/30">
              <p className="text-xs text-slate-300">個人ワークスペース</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {personalAccount.name}
              </p>
              <button
                type="button"
                onClick={() => {
                  selectAccount(personalAccount.id);
                  onNavigate(APP_ROUTES.dashboard);
                  onClose?.();
                }}
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                このワークスペースに切り替え
              </button>
            </div>
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
