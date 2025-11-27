import { useState, useMemo } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import useAccountState from "../accounts/hooks/useAccountState";
import useCategories from "./hooks/useCategories";
import useTransactions from "./hooks/useTransactions";
import TransactionList from "./components/TransactionList";
import type { Transaction } from "./types";

const TransactionsListPage = () => {
  const { currentAccount } = useAccountState();
  const { categories } = useCategories();
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
    updateFilter,
    resetFilters,
    toggleSort,
    setPage,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; amount: string; date: string; memo: string }>({
    title: "",
    amount: "",
    date: "",
    memo: "",
  });

  const handleDelete = async (transaction: Transaction) => {
    await deleteTransaction(transaction);
  };

  const handleEditOpen = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      title: transaction.title,
      amount: String(transaction.amount),
      date: transaction.date,
      memo: transaction.memo ?? "",
    });
  };

  const handleEditSave = async () => {
    if (!editingTransaction) return;
    await updateTransaction(editingTransaction, {
      type: editingTransaction.resourceType,
      title: editForm.title,
      amount: Number(editForm.amount) || editingTransaction.amount,
      date: editForm.date,
      memo: editForm.memo,
      categoryId: editingTransaction.category.id,
    });
    setEditingTransaction(null);
  };

  if (!currentAccount) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-text-secondary">
        サイドバーからアカウントを選択してください。
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-6">
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
        }}
        onSortChange={toggleSort}
        onPageChange={setPage}
        onEdit={handleEditOpen}
        onDelete={handleDelete}
      />

      {editingTransaction ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setEditingTransaction(null)}
          />
          <Card className="relative z-10 w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-text-secondary">収支編集</p>
                <h3 className="text-lg font-semibold text-text-primary">
                  {editingTransaction.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  金額
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  日付
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  メモ
                </label>
                <textarea
                  value={editForm.memo}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, memo: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
                  placeholder="メモを入力"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTransaction(null)}
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={processing}
                  onClick={handleEditSave}
                >
                  保存
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default TransactionsListPage;
