import type { FC } from "react";
import GlassPanel from "../../../components/ui/GlassPanel";
import formatCurrency from "../../dashboard/utils/formatCurrency";
import BudgetProgressCircle from "./BudgetProgressCircle";
import type { Budget } from "../types";

type BudgetCardProps = {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
};

const BudgetCard: FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
  const percentage = Number.isFinite(budget.percentage) ? budget.percentage ?? 0 : 0;
  const isOverrun = (budget.currentSpent ?? 0) > budget.amount;
  const remaining = Math.max(budget.remaining ?? 0, 0);

  return (
    <GlassPanel
      as="article"
      className={`flex h-full w-full flex-col justify-between gap-4 ${
        isOverrun ? "border-rose-200/70 ring-rose-200/50" : ""
      }`}
      interactive
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {budget.periodLabel}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {budget.name?.trim() || budget.category?.name || "無題の予算"}
          </h3>
          {budget.category ? (
            <p className="mt-1 inline-flex items-center gap-2 text-xs text-slate-500">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: budget.category.color ?? "#94a3b8" }}
              />
              {budget.category.name}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">全カテゴリ対象</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget)}
            className="rounded-full border border-rose-200 px-3 py-1 font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
          >
            削除
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex justify-center lg:block">
          <BudgetProgressCircle percentage={percentage} isOverrun={isOverrun} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between text-sm text-slate-600">
            <span>予算 {formatCurrency(budget.amount)}</span>
            <span>
              実績 {formatCurrency(budget.currentSpent ?? 0)}
              <span className={`ml-1 font-semibold ${isOverrun ? "text-rose-600" : "text-emerald-600"}`}>
                ({percentage.toFixed(1)}%)
              </span>
            </span>
          </div>
          <p
            className={`text-xs font-semibold ${
              isOverrun ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {isOverrun
              ? `予算超過 ${formatCurrency((budget.currentSpent ?? 0) - budget.amount)}`
              : `残り ${formatCurrency(remaining)}`}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
};

export default BudgetCard;
