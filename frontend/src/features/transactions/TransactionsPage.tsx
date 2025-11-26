import { useRef, useState } from "react";
import CalendarOverview from "../dashboard/components/CalendarOverview";
import useAccountState from "../accounts/hooks/useAccountState";
import CategoryManager, {
  type CategoryManagerHandle,
} from "./components/CategoryManager";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import useCategories from "./hooks/useCategories";
import useTransactions from "./hooks/useTransactions";
import type { Transaction, TransactionPayload } from "./types";

const TransactionsPage = () => {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-surface p-8 text-center text-text-secondary shadow-sm border border-border">
          ワークスペースが選択されていません。ヘッダーからアカウントを選択してください。
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">収支を登録</h1>
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
              onCreate={async (payload) => { await createCategory(payload); }}
              onUpdate={async (id, payload) => { await updateCategory(id, payload); }}
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
            className="h-fit"
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
    </div>
  );
};

export default TransactionsPage;
