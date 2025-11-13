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
import type { Transaction, TransactionPayload } from "./types";

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
    createCategory,
    updateCategory,
    deleteCategory,
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

  const headerActions = (
    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
      <span className="text-lg">🔍</span>
      <input
        value={filters.search}
        onChange={(event) => updateFilter("search", event.target.value)}
        placeholder="取引を検索"
        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:w-72"
      />
    </div>
  );

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

  if (!currentAccount) {
    return (
      <DashboardShell
        userName={userName}
        onLogout={onLogout}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        headerTitle="収支登録"
        headerSubtitle="アカウントを選択すると収支を登録できます。"
      >
        <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          ワークスペースが選択されていません。サイドバーからアカウントを選択してください。
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
      headerTitle="収支を登録"
      headerSubtitle={`${currentAccount.name} の実データを管理できます。`}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
              onCreate={createCategory}
              onUpdate={updateCategory}
              onDelete={deleteCategory}
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
