import { useMemo, type ReactNode } from "react";
import type { AppRoute } from "../../../routes";
import { APP_ROUTES, matchAccountRoute } from "../../../routes";
import AccountSwitcher from "./AccountSwitcher";
import HaruveIcon from "./HaruveIcon";
import useAccountState from "../../accounts/hooks/useAccountState";
import type { AccountSummary } from "../../accounts/types";

const MAIN_NAVIGATION: Array<{ label: string; icon: string; route: AppRoute }> = [
  { label: "ダッシュボード", icon: "home", route: APP_ROUTES.dashboard },
  { label: "収支を登録", icon: "receipt", route: APP_ROUTES.transactions },
];

const accountTypeLabel = (account: AccountSummary | null) =>
  account?.accountType === "personal" ? "個人" : "チーム";

const accountTypePillClass = (account: AccountSummary) =>
  account.accountType === "personal"
    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
    : "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100";

type DesktopMenuTriggerProps = {
  icon: string;
  label: string;
  children: ReactNode;
  position?: "center" | "top";
  isActive?: boolean;
};

const DesktopMenuTrigger = ({ icon, label, children, position = "center", isActive = false }: DesktopMenuTriggerProps) => (
  <div className="group/menu relative flex w-full justify-center">
    <button
      type="button"
      aria-label={label}
      className={`flex h-12 w-12 items-center justify-center rounded-2xl text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 hover:bg-slate-50 hover:text-slate-900 ${
        isActive ? "ring-2 ring-slate-300" : ""
      }`}
    >
      <span className="material-icons text-2xl">{icon}</span>
    </button>
    <div className={`pointer-events-none absolute left-full z-[70] flex items-center opacity-0 transition duration-200 group-hover/menu:pointer-events-auto group-hover/menu:opacity-100 group-focus-within/menu:pointer-events-auto group-focus-within/menu:opacity-100 ${
      position === "top"
        ? "bottom-0 translate-y-0"
        : "top-1/2 -translate-y-1/2"
    }`}>
      <div className="h-full w-3 flex-shrink-0" />
      <div className="w-72 rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-900/10">
        <p className="mb-3 text-xs font-semibold text-slate-400">{label}</p>
        {children}
      </div>
    </div>
  </div>
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
  const baseClass = "flex flex-col bg-white px-6 py-8";
  const mobileClass = `${baseClass} w-[90%] max-w-sm border-l border-slate-200 fixed inset-y-0 right-0 z-[60] flex shadow-2xl shadow-slate-900/10 h-screen transition-transform duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
  }`;
  const shouldCloseOnAction = variant === "mobile";
  const { currentAccount, selectAccount, accounts } = useAccountState();

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
    }

    if (shouldCloseOnAction) {
      onClose?.();
    }
  };

  const renderDesktop = () => (
    <aside className="fixed inset-y-0 left-0 z-[60] hidden w-24 flex-col items-center border-r border-slate-200 bg-white px-2 py-6 lg:flex">
      <div className="flex h-full w-full flex-col items-center justify-between">
        <div className="flex w-full flex-col items-center gap-5">
          <div className="flex w-full flex-col items-center gap-6">
            <div className="flex h-10 w-10 items-center justify-center">
              <HaruveIcon className="h-10 w-10" />
            </div>
            <div className="group/menu relative flex w-full justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-600 text-white transition hover:bg-slate-800">
                <span className="material-icons text-2xl">account_circle</span>
              </div>
              <div className="pointer-events-none absolute left-full top-1/2 z-[70] flex -translate-y-1/2 items-center opacity-0 transition duration-200 group-hover/menu:pointer-events-auto group-hover/menu:opacity-100 group-focus-within/menu:pointer-events-auto group-focus-within/menu:opacity-100">
                <div className="h-full w-3 flex-shrink-0" />
                <div className="w-72 rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-900/10">
                  <p className="mb-3 text-xs font-semibold text-slate-400">ワークスペース</p>
                  {currentAccount ? (
                    <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
                      {accounts.map((account) => {
                        const isActive = account.id === currentAccount.id;
                        return (
                          <li key={account.id}>
                            <button
                              type="button"
                              onClick={() => handleAccountSelect(account)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                                isActive
                                  ? "bg-slate-900/5 text-slate-900 ring-1 ring-slate-300"
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span className="truncate">{account.name}</span>
                              <span className={`ml-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${accountTypePillClass(account)}`}>
                                {accountTypeLabel(account)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">
                      表示できるワークスペースがありません。
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-5">
            <DesktopMenuTrigger 
              icon="space_dashboard" 
              label="メインメニュー"
              isActive={MAIN_NAVIGATION.some((item) => currentRoute === item.route)}
            >
              <ul className="space-y-1">
                {MAIN_NAVIGATION.map((item) => {
                  const active = currentRoute === item.route;
                  return (
                    <li key={item.route}>
                      <button
                        type="button"
                        onClick={() => onNavigate(item.route)}
                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${
                          active
                            ? "bg-slate-900/90 text-white shadow-sm shadow-indigo-200"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-icons text-base text-slate-400">
                            {item.icon}
                          </span>
                          {item.label}
                        </span>
                        {active ? (
                          <span className="material-icons text-base text-white">
                            check
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </DesktopMenuTrigger>

            {accountNavigation.length ? (
              <DesktopMenuTrigger 
                icon="layers" 
                label="アカウント管理"
                isActive={
                  accountNavigation.some((item) => currentRoute === item.route) ||
                  currentRoute === APP_ROUTES.accountCreate
                }
              >
                <ul className="space-y-1 text-sm">
                  {accountNavigation.map((item) => {
                    const active = currentRoute === item.route;
                    return (
                      <li key={item.route}>
                        <button
                          type="button"
                          onClick={() => onNavigate(item.route)}
                          className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 transition ${
                            active
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-icons text-base text-slate-400">
                              {item.icon}
                            </span>
                            {item.label}
                          </span>
                          {active ? (
                            <span className="material-icons text-base text-white">
                              radio_button_checked
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate(APP_ROUTES.accountCreate)}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 transition ${
                        currentRoute === APP_ROUTES.accountCreate
                          ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-icons text-base text-indigo-500">
                          add
                        </span>
                        新しいアカウント
                      </span>
                      <span className="material-icons text-base text-indigo-400">
                        north_east
                      </span>
                    </button>
                  </li>
                </ul>
              </DesktopMenuTrigger>
            ) : null}
          </div>
        </div>

        {onLogout ? (
          <DesktopMenuTrigger icon="person" label="ユーザー" position="top">
            <div className="space-y-3 text-sm">
              <p className="text-slate-500">
                ログアウトすると現在のセッションが終了します。
              </p>
              <button
                type="button"
                onClick={() => onLogout()}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
              >
                <span className="material-icons mr-2 text-base">logout</span>
                ログアウト
              </button>
            </div>
          </DesktopMenuTrigger>
        ) : null}
      </div>
    </aside>
  );

  const renderMobile = () => (
    <aside className={`${mobileClass} overflow-y-auto`}>
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
            {MAIN_NAVIGATION.map((item) => {
              const active = currentRoute === item.route;
              return (
                <li key={item.route}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate(item.route);
                      if (shouldCloseOnAction) {
                        onClose?.();
                      }
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
                          if (shouldCloseOnAction) {
                            onClose?.();
                          }
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
                    if (shouldCloseOnAction) {
                      onClose?.();
                    }
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
            if (shouldCloseOnAction) {
              onClose?.();
            }
          }}
          className="mt-8 flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          ログアウト
        </button>
      ) : null}
    </aside>
  );

  if (variant === "desktop") {
    return renderDesktop();
  }

  return renderMobile();
};

export default Sidebar;
