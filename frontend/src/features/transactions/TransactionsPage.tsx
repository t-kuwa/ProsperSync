import { useRef, useState } from "react";
import type { AppRoute } from "../../routes";
import CalendarOverview from "../dashboard/components/CalendarOverview";
import DashboardShell from "../dashboard/components/DashboardShell";
import useAccountState from "../accounts/hooks/useAccountState";
import CategoryManager, {
  type CategoryManagerHandle,
} from "./components/CategoryManager";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import useCategories from "./hooks/useCategories";
import useTransactions from "./hooks/useTransactions";
import type { CategoryPayload, Transaction, TransactionPayload } from "./types";
import formatCurrency from "../dashboard/utils/formatCurrency";
import GlassPanel from "../../components/ui/GlassPanel";

type DateRange = { startDate: string; endDate: string };

const formatISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const buildWeekRange = (): DateRange => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { startDate: formatISODate(start), endDate: formatISODate(end) };
};

const QUICK_DATE_FILTERS: Array<{
  label: string;
  description: string;
  getRange: () => DateRange;
}> = [
  {
    label: "今日",
    description: "今日の記録",
    getRange: () => {
      const today = new Date();
      const iso = formatISODate(today);
      return { startDate: iso, endDate: iso };
    },
  },
  {
    label: "今週",
    description: "週次フロー",
    getRange: buildWeekRange,
  },
  {
    label: "今月",
    description: "月次サマリー",
    getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: formatISODate(start), endDate: formatISODate(end) };
    },
  },
];

type TransactionsPageProps = {
  userName?: string;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const TransactionsPage = ({
  userName,
  onLogout,
  currentRoute,
  onNavigate,
}: TransactionsPageProps) => {
  const { currentAccount } = useAccountState();
  const {
    categories,
    loading: loadingCategories,
    processing: processingCategories,
    error: categoryError,
    refreshCategories,
    createCategory: createCategoryMutation,
    updateCategory: updateCategoryMutation,
    deleteCategory: deleteCategoryMutation,
  } = useCategories();
  const {
    transactions,
    totals,
    filters,
    sort,
    pagination,
    totalPages,
    loading,
    processing,
    error,
    calendarEntries,
    refreshTransactions,
    updateFilter,
    resetFilters,
    toggleSort,
    setPage,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const categoryManagerRef = useRef<CategoryManagerHandle>(null);

  const handleFormSubmit = async (
    payload: TransactionPayload,
    editing: Transaction | null,
  ) => {
    if (editing) {
      await updateTransaction(editing, payload);
    } else {
      await createTransaction(payload);
    }
    setEditingTransaction(null);
  };

  const handleDelete = async (transaction: Transaction) => {
    await deleteTransaction(transaction);
    if (editingTransaction?.uid === transaction.uid) {
      setEditingTransaction(null);
    }
  };

  const handleCreateCategory = async (payload: CategoryPayload) => {
    await createCategoryMutation(payload);
  };

  const handleUpdateCategory = async (
    categoryId: number,
    payload: CategoryPayload,
  ) => {
    await updateCategoryMutation(categoryId, payload);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    await deleteCategoryMutation(categoryId);
  };

  const handleQuickCategoryCreate = (type: "income" | "expense") => {
    categoryManagerRef.current?.openCreateModal(type);
  };

  const net = totals.income - totals.expense;

  if (!currentAccount) {
    return (
      <DashboardShell
        userName={userName}
        onLogout={onLogout}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        headerTitle="収支登録"
      >
        <GlassPanel className="text-center text-slate-500">
          ワークスペースが選択されていません。サイドバーからアカウントを選択してください。
        </GlassPanel>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="収支を登録"
    >
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <GlassPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">ワークスペース</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{currentAccount.name}</p>
              <p className="text-sm text-slate-500">
                データを登録すると、カレンダーとダッシュボードに即時反映されます。
              </p>
            </div>
            <div className="text-right text-xs font-semibold">
              <p className="text-emerald-600">収入 {formatCurrency(totals.income)}</p>
              <p className="text-rose-500">支出 {formatCurrency(totals.expense)}</p>
              <p className={`mt-1 text-sm ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                ネット {formatCurrency(net)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {QUICK_DATE_FILTERS.map((filter) => {
              const range = filter.getRange();
              const isActive =
                filters.startDate === range.startDate && filters.endDate === range.endDate;
              return (
                <button
                  key={filter.label}
                  type="button"
                  aria-label={`${filter.label}: ${filter.description}`}
                  className={`rounded-full px-4 py-1.5 transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white/80 text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    updateFilter("startDate", range.startDate);
                    updateFilter("endDate", range.endDate);
                    updateFilter("month", null);
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <button
              type="button"
              className="rounded-full bg-slate-900/5 px-4 py-1.5 text-slate-600 transition hover:bg-slate-900/10"
              onClick={() => handleQuickCategoryCreate("expense")}
            >
              支出カテゴリを追加
            </button>
            <button
              type="button"
              className="rounded-full bg-slate-900/5 px-4 py-1.5 text-slate-600 transition hover:bg-slate-900/10"
              onClick={() => handleQuickCategoryCreate("income")}
            >
              収入カテゴリを追加
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 px-4 py-1.5 text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
              onClick={() => {
                resetFilters();
                setEditingTransaction(null);
              }}
            >
              フィルタをリセット
            </button>
          </div>
        </GlassPanel>
        <GlassPanel className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3">
              <span className="material-icons text-slate-400">search</span>
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="取引を検索"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                収入 {transactions.filter((t) => t.resourceType === "income").length}
              </span>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">
                支出 {transactions.filter((t) => t.resourceType === "expense").length}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            検索に加えて日付・カテゴリでの詳細フィルタリングもサポートしています。
          </p>
        </GlassPanel>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="space-y-6">
          <TransactionForm
            categories={categories}
            loadingCategories={loadingCategories}
            processing={processing}
            editingTransaction={editingTransaction}
            onSubmit={handleFormSubmit}
            onCancelEdit={() => setEditingTransaction(null)}
            onRequestNewCategory={(type) =>
              categoryManagerRef.current?.openCreateModal(type)
            }
          />
          <div className="hidden md:block">
            <CategoryManager
              ref={categoryManagerRef}
              categories={categories}
              loading={loadingCategories}
              processing={processingCategories}
              error={categoryError}
              onCreate={handleCreateCategory}
              onUpdate={handleUpdateCategory}
              onDelete={handleDeleteCategory}
              onRefresh={refreshCategories}
            />
          </div>
        </div>

        <div className="space-y-6">
          <CalendarOverview
            accountId={currentAccount.id}
            calendarEntries={calendarEntries}
            monthlyBreakdown={[]}
            loading={loading}
            error={error}
            onRetry={refreshTransactions}
            showTrendChart={false}
          />
          <TransactionList
            transactions={transactions}
            totals={totals}
            loading={loading}
            processing={processing}
            error={error}
            filters={filters}
            sort={sort}
            pagination={pagination}
            totalPages={totalPages}
            categories={categories}
            onFilterChange={updateFilter}
            onResetFilters={() => {
              resetFilters();
              setEditingTransaction(null);
            }}
            onSortChange={toggleSort}
            onPageChange={setPage}
            onEdit={(transaction) => setEditingTransaction(transaction)}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </DashboardShell>
  );
};

export default TransactionsPage;
