import { type ReactNode, useEffect } from "react";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      aria-live="polite"
    >
      <div
        className="mx-auto max-h-[80vh] w-full rounded-t-3xl bg-white p-6 shadow-lg sm:max-w-md"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "詳細"}
      >
        <div className="mb-4 flex items-center justify-between">
          {title ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {title}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};

export default BottomSheet;
