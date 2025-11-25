import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

const BottomSheet = ({ isOpen, onClose, title, children }: BottomSheetProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] transform transition-transform duration-300 ease-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      aria-live="polite"
    >
      {/* Backdrop for closing */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10 bg-transparent"
          onClick={onClose}
        />
      )}
      
      <div
        className="mx-auto max-h-[85vh] w-full rounded-t-3xl bg-surface p-6 shadow-2xl sm:max-w-md border-t border-white/20 ring-1 ring-black/5"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "詳細"}
      >
        <div className="mb-4 flex items-center justify-between">
          {title ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              {title}
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="rounded-full bg-surface-hover p-1 text-text-secondary hover:text-text-primary transition-colors"
            onClick={onClose}
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-1 -mr-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default BottomSheet;
