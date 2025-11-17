import { useState } from "react";
import type { AppRoute } from "../../routes";
import DashboardShell from "../dashboard/components/DashboardShell";
import useAccountState from "../accounts/hooks/useAccountState";
import useCategories from "../transactions/hooks/useCategories";
import BudgetForm from "./components/BudgetForm";
import BudgetList from "./components/BudgetList";
import BudgetEditModal from "./components/BudgetEditModal";
import useBudgets from "./hooks/useBudgets";
import formatCurrency from "../dashboard/utils/formatCurrency";
import type { Budget, BudgetPayload } from "./types";

type BudgetsPageProps = {
  userName?: string;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const BudgetsPage = ({
  userName,
  onLogout,
  currentRoute,
  onNavigate,
}: BudgetsPageProps) => {
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
      <DashboardShell
        userName={userName}
        onLogout={onLogout}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        headerTitle="予算管理"
      >
        <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          サイドバーからアカウントを選択してください。
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="予算管理"
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-3xl bg-white/90 px-6 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
        <span>
          合計予算
          <span className="ml-1 font-semibold text-slate-900">
            {formatCurrency(totals.totalBudget)}
          </span>
        </span>
        <span>
          実績
          <span className="ml-1 font-semibold text-slate-900">
            {formatCurrency(totals.totalSpent)}
          </span>
        </span>
        <span className={totals.overruns > 0 ? "text-rose-600" : "text-emerald-600"}>
          {totals.overruns > 0 ? `超過 ${totals.overruns} 件` : "すべて順調です"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <BudgetForm
            categories={categories}
            processing={processing || loadingCategories}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />

          <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <label className="flex flex-col text-xs text-slate-500">
              期間タイプ
              <select
                value={filters.periodType}
                onChange={(event) =>
                  updateFilters({ periodType: event.target.value as Budget["periodType"] })
                }
                className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="monthly">月次</option>
                <option value="yearly">年次</option>
              </select>
            </label>
            <label className="flex flex-col text-xs text-slate-500">
              年
              <input
                type="number"
                value={filters.year}
                onChange={(event) => updateFilters({ year: Number(event.target.value) })}
                className="mt-1 w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            {filters.periodType === "monthly" ? (
              <label className="flex flex-col text-xs text-slate-500">
                月
                <input
                  type="number"
                  value={filters.month ?? ""}
                  onChange={(event) =>
                    updateFilters({
                      month: event.target.value ? Number(event.target.value) : null,
                    })
                  }
                  className="mt-1 w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  min={1}
                  max={12}
                />
              </label>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
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
    </DashboardShell>
  );
};

export default BudgetsPage;
