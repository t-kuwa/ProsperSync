import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  const hasValidRefs = useCallback(() => {
    return contentRef.current !== null && containerRef.current !== null;
  }, []);

  const calculateHeight = useCallback((): number | null => {
    if (!hasValidRefs()) {
      return null;
    }

    const contentHeight = contentRef.current!.scrollHeight;
    const computedStyle = window.getComputedStyle(containerRef.current!);
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    const newHeight = contentHeight + paddingTop + paddingBottom;

    return newHeight > 0 ? newHeight : null;
  }, [hasValidRefs]);

  const updateHeight = useCallback(() => {
    const newHeight = calculateHeight();
    if (newHeight !== null) {
      setHeight(newHeight);
    }
  }, [calculateHeight]);

  // NOTE: useLayoutEffectはDOMの変更を同期的に処理するため、
  // タブ切り替え時に高さを即座に計算してレイアウトシフトを防ぐために使用
  useLayoutEffect(() => {
    if (!hasValidRefs()) {
      return;
    }

    requestAnimationFrame(() => {
      updateHeight();
    });
  }, [activeTab, children, hasValidRefs, updateHeight]);

  // NOTE: ResizeObserverを設定して、コンテンツサイズの変更を監視し、動的に高さを更新するために使用
  useEffect(() => {
    if (!hasValidRefs()) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateHeight);
    });

    resizeObserver.observe(contentRef.current!);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeTab, children, hasValidRefs, updateHeight]);

  // NOTE: タブ切り替えや高さ変更時に、カードを画面中央にスクロールするために使用
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (typeof height !== "number") {
      return;
    }

    const scrollToCenter = () => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY + rect.top - windowHeight / 2 + rect.height / 2;

      window.scrollTo({
        top: Math.max(0, scrollY),
        behavior: "smooth",
      });
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToCenter);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [activeTab, height]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl bg-white px-6 py-8 shadow-lg shadow-slate-900/10 ring-1 ring-slate-200 transition-[height] duration-300 ease-in-out md:px-8 md:py-10"
      style={{ height: typeof height === "number" ? `${height}px` : "auto" }}
    >
      <div ref={contentRef} className="w-full">
        {activeTab === "signup" && (
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
            <span>アカウントをお持ちですか？</span>
            <button
              type="button"
              onClick={() => onTabChange("login")}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
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
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              新規登録
            </button>
          </div>
        )}

        <AuthTabs activeTab={activeTab} onChange={onTabChange} />

        <div className="mt-8">
          <h1 className="text-3xl font-semibold text-slate-900 md:text-3xl lg:text-4xl">{heading}</h1>
          <p className="mt-2 text-sm text-slate-500 md:text-sm lg:text-base">{subheading}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
