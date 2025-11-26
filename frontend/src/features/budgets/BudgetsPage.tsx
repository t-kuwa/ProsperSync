import { useState } from "react";
import useAccountState from "../accounts/hooks/useAccountState";
import useCategories from "../transactions/hooks/useCategories";
import BudgetForm from "./components/BudgetForm";
import BudgetList from "./components/BudgetList";
import BudgetEditModal from "./components/BudgetEditModal";
import useBudgets from "./hooks/useBudgets";
import formatCurrency from "../dashboard/utils/formatCurrency";
import type { Budget, BudgetPayload } from "./types";
import { Card } from "../../components/ui/Card";

const BudgetsPage = () => {
  const { currentAccount } = useAccountState();
  const { categories, loading: loadingCategories, refreshCategories } = useCategories();
  const {
    budgets,
    filters,
    totals,
    loading,
    processing,
    error,
    updateFilters,
    create,
    update,
    remove,
    refresh,
  } = useBudgets();
  const [editing, setEditing] = useState<Budget | null>(null);

  const handleSubmit = async (payload: BudgetPayload, editingBudget?: Budget | null) => {
    if (editingBudget) {
      await update(editingBudget, payload);
    } else {
      await create(payload);
    }
    setEditing(null);
    void refreshCategories();
  };

  const handleDelete = async (budget: Budget) => {
    if (
      window.confirm(
        `${budget.name?.trim() || budget.category?.name || "この予算"} を削除しますか？`,
      )
    ) {
      await remove(budget);
    }
  };

  if (!currentAccount) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center text-text-secondary">
          サイドバーからアカウントを選択してください。
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Card className="flex flex-wrap items-center gap-3 px-6 py-4 text-sm text-text-secondary">
        <span>
          合計予算
          <span className="ml-1 font-semibold text-text-primary">
            {formatCurrency(totals.totalBudget)}
          </span>
        </span>
        <span>
          実績
          <span className="ml-1 font-semibold text-text-primary">
            {formatCurrency(totals.totalSpent)}
          </span>
        </span>
        <span className={totals.overruns > 0 ? "text-red-600" : "text-emerald-600"}>
          {totals.overruns > 0 ? `超過 ${totals.overruns} 件` : "すべて順調"}
        </span>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="space-y-6">
          <BudgetForm
            categories={categories}
            processing={processing || loadingCategories}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />

          <Card className="p-4 flex flex-wrap items-center gap-3">
            <label className="flex flex-col text-xs text-text-secondary">
              期間タイプ
              <select
                value={filters.periodType}
                onChange={(event) =>
                  updateFilters({ periodType: event.target.value as Budget["periodType"] })
                }
                className="mt-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
              >
                <option value="monthly">月次</option>
                <option value="yearly">年次</option>
              </select>
            </label>
            <label className="flex flex-col text-xs text-text-secondary">
              年
              <input
                type="number"
                value={filters.year}
                onChange={(event) => updateFilters({ year: Number(event.target.value) })}
                className="mt-1 w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
              />
            </label>
            {filters.periodType === "monthly" ? (
              <label className="flex flex-col text-xs text-text-secondary">
                月
                <input
                  type="number"
                  value={filters.month ?? ""}
                  onChange={(event) =>
                    updateFilters({
                      month: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                  className="mt-1 w-20 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
                  min={1}
                  max={12}
                />
              </label>
            ) : null}
          </Card>
        </div>

        <div className="space-y-6">
          <BudgetList
            budgets={budgets}
            loading={loading}
            error={error}
            onRetry={refresh}
            onEdit={(budget) => setEditing(budget)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <BudgetEditModal
        budget={editing}
        categories={categories}
        processing={processing}
        onSubmit={handleSubmit}
        onClose={() => setEditing(null)}
      />
    </div>
  );
};

export default BudgetsPage;
