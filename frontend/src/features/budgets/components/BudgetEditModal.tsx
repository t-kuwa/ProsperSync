import { useEffect } from "react";
import type { Category } from "../../transactions/types";
import type { Budget, BudgetPayload } from "../types";
import BudgetForm from "./BudgetForm";
import { Card } from "../../../components/ui/Card";

type BudgetEditModalProps = {
  budget: Budget | null;
  categories: Category[];
  processing: boolean;
  onSubmit: (payload: BudgetPayload, editing?: Budget | null) => Promise<void>;
  onClose: () => void;
};

const BudgetEditModal = ({ budget, categories, processing, onSubmit, onClose }: BudgetEditModalProps) => {
  useEffect(() => {
    if (!budget) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [budget, onClose]);

  if (!budget) {
    return null;
  }

  const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-background/80 px-3 py-10 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl p-6 sm:p-8 shadow-2xl"
        onClick={handleWrapperClick}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Budget</p>
            <h2 className="text-xl font-semibold text-text-primary">予算を編集</h2>
            <p className="text-sm text-text-secondary">
              期間や金額、カテゴリを調整して、常に正確な進捗を把握できます。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-secondary transition hover:bg-surface hover:text-text-primary"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="pt-6">
          <BudgetForm
            categories={categories}
            processing={processing}
            editing={budget}
            onSubmit={onSubmit}
            onCancel={onClose}
            variant="plain"
            showRepeatActions={false}
            showHeader={false}
          />
        </div>
      </Card>
    </div>
  );
};

export default BudgetEditModal;
