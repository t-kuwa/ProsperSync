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
      className={`sticky top-0 z-50 px-3 sm:px-6 pb-4 pt-4 lg:hidden transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/35 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-white/40" />
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <HaruveIcon className="h-8 w-8" />
              <span className="text-base font-semibold text-slate-900">Haruve</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 border border-white/60 text-slate-700 shadow-sm hover:bg-white/80 transition"
              aria-label="通知"
            >
              <span className="material-icons text-base">notifications</span>
            </button>
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 border border-white/60 text-lg text-slate-700 shadow-sm hover:bg-white/70 transition"
              aria-label="メニューを開く"
            >
              <span className="material-icons text-base">menu</span>
            </button>
          </div>
        </div>
      </div>
      <span className="sr-only">{title}</span>
      {userName ? (
        <span className="sr-only">こんにちは、{userName} さん</span>
      ) : null}
    </header>
  );
};

export default DashboardHeader;
