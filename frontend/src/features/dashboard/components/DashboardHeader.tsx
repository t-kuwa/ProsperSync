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
  <header className="border-b border-slate-200 bg-white/60 px-4 pt-6 pb-0 backdrop-blur-sm sm:px-6 lg:border-transparent lg:bg-transparent lg:px-12 lg:pb-6 lg:pt-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
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
          {subtitle ? (
            <p className="text-sm text-slate-500">{subtitle}</p>
          ) : null}
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {title}
          </h1>
        </div>
      </div>

      {actions ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  </header>
);

export default DashboardHeader;
