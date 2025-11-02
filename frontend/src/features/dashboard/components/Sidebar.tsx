import type { AppRoute } from "../../../routes";

type SidebarProps = {
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  variant?: "desktop" | "mobile";
  onClose?: () => void;
};

const mainNavigation: Array<{
  label: string;
  icon: string;
  route: AppRoute;
}> = [
  { label: "概要", icon: "📊", route: "/dashboard" },
  { label: "トランザクション", icon: "🗂️", route: "/transactions" },
];

const secondaryNavigation = [
  { label: "アカウント", icon: "🏦" },
  { label: "メンバー", icon: "👥" },
  { label: "レポート", icon: "📈" },
  { label: "セキュリティ", icon: "🔐" },
  { label: "設定", icon: "⚙️" },
];

const Sidebar = ({
  onLogout,
  currentRoute,
  onNavigate,
  variant = "desktop",
  onClose,
}: SidebarProps) => {
  const baseClass =
    "flex w-64 flex-col border-r border-slate-200 bg-white px-6 py-8";
  const desktopClass = `${baseClass} hidden lg:flex`;
  const mobileClass = `${baseClass} fixed inset-y-0 left-0 z-40 flex shadow-2xl shadow-slate-900/10`;

  return (
    <aside className={variant === "desktop" ? desktopClass : mobileClass}>
      <div className="mb-12 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-semibold text-white">
            H
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">Haruve</p>
            <p className="text-sm text-slate-500">財務ダッシュボード</p>
          </div>
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
