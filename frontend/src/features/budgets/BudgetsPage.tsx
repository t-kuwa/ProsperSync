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
import GlassPanel from "../../components/ui/GlassPanel";

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
        <GlassPanel className="text-center text-slate-500">
          サイドバーからアカウントを選択してください。
        </GlassPanel>
      </DashboardShell>
    );
  }

  const utilization =
    totals.totalBudget > 0
      ? Math.min((totals.totalSpent / totals.totalBudget) * 100, 999)
      : 0;
  const remainingBudget = Math.max(totals.totalBudget - totals.totalSpent, 0);

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="予算管理"
    >
      <div className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <GlassPanel tone="accent" className="text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">予算サマリー</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[{
              label: "合計予算",
              value: formatCurrency(totals.totalBudget),
            },
            {
              label: "実績",
              value: formatCurrency(totals.totalSpent),
            },
            {
              label: "残り",
              value: formatCurrency(remainingBudget),
            }].map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/80">使用率</span>
              <span>{utilization.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-white/30">
              <div
                className={`h-full rounded-full ${utilization > 100 ? "bg-rose-200" : "bg-white"}`}
                style={{ width: `${Math.min(utilization, 120)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-white/80">
              {totals.overruns > 0 ? `超過 ${totals.overruns} 件 - 調整が必要です。` : "すべての予算がガイドライン内に収まっています。"}
            </p>
          </div>
        </GlassPanel>
        <GlassPanel className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">集計対象</p>
            <p className="mt-1 text-sm text-slate-500">期間を切り替えてトレンドを確認しましょう。</p>
          </div>
          <div className="flex flex-wrap items-end gap-4 text-sm">
            <label className="flex flex-col text-xs text-slate-500">
              期間タイプ
              <select
                value={filters.periodType}
                onChange={(event) =>
                  updateFilters({ periodType: event.target.value as Budget["periodType"] })
                }
                className="mt-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
                className="mt-1 w-24 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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
                  className="mt-1 w-20 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  min={1}
                  max={12}
                />
              </label>
            ) : null}
          </div>
        </GlassPanel>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <GlassPanel className="space-y-4" padding="none">
          <BudgetForm
            categories={categories}
            processing={processing || loadingCategories}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            variant="plain"
          />
        </GlassPanel>

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
