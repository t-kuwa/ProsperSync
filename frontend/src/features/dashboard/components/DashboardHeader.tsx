import { useEffect, useState, type ReactNode } from "react";
import HaruveIcon from "./HaruveIcon";

type DashboardHeaderProps = {
  userName?: string;
  title: string;
  actions?: ReactNode;
  onMenuClick?: () => void;
};

const DashboardHeader = ({
  userName,
  title,
  actions,
  onMenuClick,
}: DashboardHeaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // トップ付近では常に表示
      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // 下スクロール時：非表示
      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      // 上スクロール時：表示
      else if (currentScrollY < lastScrollY) {
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
      className={`sticky top-0 z-50 border-b border-slate-200 bg-white/70 px-4 pb-4 pt-4 backdrop-blur-sm transition-transform duration-300 sm:px-6 lg:hidden ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HaruveIcon className="h-6 w-6" />
          <p className="text-lg font-semibold text-slate-900">Haruve</p>
        </div>
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="メニューを開く"
        >
          ☰
        </button>
      </div>

      <div className="mt-4 space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {userName ? (
          <p className="text-xs text-slate-400">こんにちは、{userName} さん</p>
        ) : null}
      </div>

      {actions ? (
        <div className="mt-4 flex flex-col gap-2">{actions}</div>
      ) : null}
    </header>
  );
};

export default DashboardHeader;
