import type { ActiveTab } from "../types";

const toggleButtonClass = (current: ActiveTab, tab: ActiveTab) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    current === tab
      ? "bg-slate-900 text-white shadow-lg shadow-indigo-500/20"
      : "text-slate-500 hover:text-slate-700"
  }`;

export const AuthTabs = ({
  activeTab,
  onChange,
}: {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}) => (
  <div className="mt-6 flex items-center gap-2">
    <button
      type="button"
      onClick={() => onChange("signup")}
      className={toggleButtonClass(activeTab, "signup")}
    >
      アカウント登録
    </button>
    <button
      type="button"
      onClick={() => onChange("login")}
      className={toggleButtonClass(activeTab, "login")}
    >
      ログイン
    </button>
  </div>
);

export default AuthTabs;
