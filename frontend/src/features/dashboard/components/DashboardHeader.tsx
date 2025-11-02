import type { ReactNode } from "react";

type DashboardHeaderProps = {
  userName?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onMenuClick?: () => void;
};

const DashboardHeader = ({
  userName,
  title,
  subtitle,
  actions,
  onMenuClick,
}: DashboardHeaderProps) => (
  <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/60 px-4 py-4 backdrop-blur-sm sm:px-6 lg:border-transparent lg:bg-transparent lg:px-0 lg:py-0">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="メニューを開く"
        >
          ☰
        </button>
        <div>
          <p className="text-sm text-slate-500">
            {subtitle ??
              `おかえりなさい${userName ? `、${userName}さん` : ""}`}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {title}
          </h1>
        </div>
      </div>
    </div>

    {actions ? (
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {actions}
      </div>
    ) : null}
  </header>
);

export default DashboardHeader;
