import type { FC } from "react";
import type { DashboardBudgetSummary } from "../types";
import formatCurrency from "../utils/formatCurrency";

type BudgetHighlightsProps = {
  summary: DashboardBudgetSummary;
  className?: string;
};

const BudgetHighlights: FC<BudgetHighlightsProps> = ({ summary, className }) => {
  if (!summary.topBudgets.length) {
    return (
      <section className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className ?? ""}`}>
        <h3 className="text-base font-semibold text-slate-900">予算ハイライト</h3>
        <p className="mt-2 text-sm text-slate-500">
          今月の予算はまだ登録されていません。予算ページで作成しましょう。
        </p>
      </section>
    );
  }

  return (
    <section className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className ?? ""}`}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">予算ハイライト</h3>
          <p className="text-xs text-slate-500">
            合計 {formatCurrency(summary.totalBudget)} / 実績 {formatCurrency(summary.totalSpent)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            summary.overruns > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {summary.overruns > 0 ? `超過 ${summary.overruns} 件` : "順調です"}
        </span>
      </header>

      <ul className="mt-4 space-y-3">
        {summary.topBudgets.map((budget) => {
          const isOverrun = budget.currentSpent > budget.amount;
          return (
            <li key={budget.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {budget.name?.trim() || budget.category?.name || budget.periodLabel}
                </p>
                <p className="text-xs text-slate-500">
                  {budget.periodLabel}
                  {budget.category ? `・${budget.category.name}` : "・全カテゴリ"}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>
                  実績 {formatCurrency(budget.currentSpent)} / 予算 {formatCurrency(budget.amount)}
                </p>
                <p className={isOverrun ? "text-rose-600" : "text-emerald-600"}>
                  {budget.percentage.toFixed(1)}%
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default BudgetHighlights;
