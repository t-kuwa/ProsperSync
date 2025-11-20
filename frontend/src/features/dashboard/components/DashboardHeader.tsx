import { useEffect, useState } from "react";
import HaruveIcon from "./HaruveIcon";

type DashboardHeaderProps = {
  userName?: string;
  title: string;
  onMenuClick?: () => void;
};

const DashboardHeader = ({
  userName,
  title,
  onMenuClick,
}: DashboardHeaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`lg:hidden ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } sticky top-3 z-50 px-4 transition-transform duration-300 sm:px-6`}
    >
      <div className="rounded-[28px] border border-white/60 bg-white/80 px-4 py-3 shadow-floating backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-600 transition hover:bg-slate-900/10"
              aria-label="メニューを開く"
            >
              <span className="material-icons">menu</span>
            </button>
            <div>
              <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <HaruveIcon className="h-6 w-6" />
                Haruve
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
            </div>
          </div>
          {userName ? (
            <div className="flex flex-col items-end text-right">
              <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">ユーザー</span>
              <span className="rounded-2xl bg-slate-900/5 px-3 py-1 text-sm font-semibold text-slate-700">
                {userName}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <span className="sr-only">{title}</span>
    </header>
  );
};

export default DashboardHeader;
