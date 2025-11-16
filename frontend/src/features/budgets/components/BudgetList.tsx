import type { FC } from "react";
import type { Budget } from "../types";
import BudgetCard from "./BudgetCard";

type BudgetListProps = {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
};

const BudgetList: FC<BudgetListProps> = ({
  budgets,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
        予算データを読み込んでいます…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-rose-100">
        <p className="text-sm text-rose-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
        >
          もう一度試す
        </button>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
        まだ予算が登録されていません。左側のフォームから作成できます。
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {budgets.map((budget) => (
        <div key={budget.id} className="min-w-0">
          <BudgetCard budget={budget} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
};

export default BudgetList;
