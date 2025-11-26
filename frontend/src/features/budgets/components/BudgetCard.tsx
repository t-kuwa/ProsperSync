import type { FC } from "react";
import formatCurrency from "../../dashboard/utils/formatCurrency";
import BudgetProgressCircle from "./BudgetProgressCircle";
import type { Budget } from "../types";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

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
    <Card
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden transition hover:shadow-md ${
        isOverrun ? "border-red-200 ring-2 ring-red-100" : ""
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {budget.periodLabel}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-text-primary">
              {budget.name?.trim() || budget.category?.name || "無題の予算"}
            </h3>
            {budget.category ? (
              <p className="mt-1 inline-flex items-center gap-2 text-xs text-text-secondary">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: budget.category.color ?? "#94a3b8" }}
                />
                {budget.category.name}
              </p>
            ) : (
              <p className="mt-1 text-xs text-text-secondary">全カテゴリ対象</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(budget)}
              className="h-7 px-3 text-xs"
            >
              編集
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(budget)}
              className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            >
              削除
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex justify-center lg:block">
            <BudgetProgressCircle percentage={percentage} isOverrun={isOverrun} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between text-sm text-text-secondary">
              <span>予算 {formatCurrency(budget.amount)}</span>
              <span>
                実績 {formatCurrency(budget.currentSpent ?? 0)}
                <span className={`ml-1 font-semibold ${isOverrun ? "text-red-600" : "text-green-600"}`}>
                  ({percentage.toFixed(1)}%)
                </span>
              </span>
            </div>
            <p
              className={`text-xs font-semibold ${
                isOverrun ? "text-red-600" : "text-text-secondary"
              }`}
            >
              {isOverrun
                ? `予算超過 ${formatCurrency((budget.currentSpent ?? 0) - budget.amount)}`
                : `残り ${formatCurrency(remaining)}`}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCard;
