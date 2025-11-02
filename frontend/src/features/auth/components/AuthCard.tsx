import type { ReactNode } from "react";
import type { ActiveTab } from "../types";
import AuthTabs from "./AuthTabs";

export const AuthCard = ({
  activeTab,
  onTabChange,
  heading,
  subheading,
  children,
}: {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  heading: string;
  subheading: string;
  children: ReactNode;
}) => (
  <div className="relative z-10 -mt-12 flex flex-1 flex-col rounded-t-3xl bg-slate-950 px-6 pt-16 pb-12 shadow-[0_-32px_80px_rgba(15,23,42,0.45)] md:mt-0 md:rounded-none md:bg-transparent md:px-10 md:py-10 md:shadow-none">
    {activeTab === "signup" && (
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
        <span>アカウントをお持ちですか？</span>
        <button
          type="button"
          onClick={() => onTabChange("login")}
          className="font-semibold text-indigo-300 hover:text-indigo-200"
        >
          ログイン
        </button>
      </div>
    )}

    {activeTab === "login" && (
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
        <span>アカウントをお持ちでないですか？</span>
        <button
          type="button"
          onClick={() => onTabChange("signup")}
          className="font-semibold text-indigo-300 hover:text-indigo-200"
        >
          新規登録
        </button>
      </div>
    )}

    <AuthTabs activeTab={activeTab} onChange={onTabChange} />

    <div className="mt-8">
      <h1 className="text-3xl font-semibold text-white md:text-4xl">{heading}</h1>
      <p className="mt-2 text-sm text-slate-400">{subheading}</p>
      {children}
    </div>
  </div>
);

export default AuthCard;
