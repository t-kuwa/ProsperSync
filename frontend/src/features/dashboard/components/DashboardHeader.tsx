import { useEffect, useState, type ReactNode } from "react";
import haruveIcon from "../../../assets/haruveIcon.svg";

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
      className={`sticky top-0 z-50 border-b border-slate-200 bg-white/60 px-4 pt-4 pb-4 backdrop-blur-sm transition-transform duration-300 sm:px-6 lg:border-transparent lg:bg-transparent lg:px-12 lg:pb-4 lg:pt-4 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
    {/* モバイル版：サイトタイトル（左）とメニューボタン（右） */}
    <div className="flex items-center justify-between lg:hidden">
      <div className="flex items-center gap-2">
        <img src={haruveIcon} alt="Haruve" className="h-6 w-6" />
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

    {/* デスクトップ版：タイトルとアクション */}
    <div className="hidden lg:flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="flex items-start gap-3">
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
};

export default DashboardHeader;
