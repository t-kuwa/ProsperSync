import { useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import useAccountState from "../accounts/hooks/useAccountState";
import useCategories from "../transactions/hooks/useCategories";
import FixedRecurringForm from "./components/FixedRecurringForm";
import FixedRecurringList from "./components/FixedRecurringList";
import OccurrenceBoard from "./components/OccurrenceBoard";
import useFixedRecurring from "./hooks/useFixedRecurring";
import type { FixedRecurringEntry } from "./types";
import formatCurrency from "../dashboard/utils/formatCurrency";

const FixedRecurringPage = () => {
  const { currentAccount } = useAccountState();
  const { categories, loading: loadingCategories, refreshCategories } = useCategories();
  const {
    entries,
    occurrences,
    selectedMonth,
    setSelectedMonth,
    loading,
    processing,
    error,
    stats,
    refreshAll,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useFixedRecurring();
  const [editing, setEditing] = useState<FixedRecurringEntry | null>(null);

  const monthlyNet = useMemo(
    () => stats.incomeTotal - stats.expenseTotal,
    [stats],
  );

  const handleSubmit = async (payload: Parameters<typeof createEntry>[0], entry?: FixedRecurringEntry | null) => {
    if (entry) {
      await updateEntry(entry.id, payload);
      setEditing(null);
    } else {
      await createEntry(payload);
    }
    void refreshCategories();
  };

  const handleDelete = async (entry: FixedRecurringEntry) => {
    if (window.confirm(`${entry.title} を削除しますか？`)) {
      await deleteEntry(entry.id);
    }
  };

  if (!currentAccount) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center text-text-secondary">
          サイドバーからアカウントを選択してください。
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">Fixed Recurring</p>
          <h1 className="text-3xl font-bold text-text-primary">固定収支の管理</h1>
          <p className="text-sm text-text-secondary">
            テンプレートを作成すると、全期間の発生が即時同期されます。期間短縮時も適用済みはキャンセルで保持します。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing(null);
              void refreshAll();
            }}
            disabled={loading}
          >
            <span className="material-icons text-base mr-1">refresh</span>
            再読み込み
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5 border border-white/70 bg-gradient-to-br from-primary/10 via-white to-white shadow-soft">
          <p className="text-xs text-primary font-semibold uppercase tracking-wide">今月のネット</p>
          <p className={`text-3xl font-bold mt-2 ${monthlyNet >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {formatCurrency(monthlyNet)}
          </p>
          <p className="text-sm text-text-secondary">固定収入 - 固定支出</p>
        </Card>
        <Card className="p-5 border border-white/70">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide">テンプレート数</p>
          <p className="text-3xl font-bold mt-2 text-text-primary">{entries.length}</p>
          <p className="text-sm text-text-secondary">有効/無効期間を含む総数</p>
        </Card>
        <Card className="p-5 border border-white/70">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide">今月の発生</p>
          <p className="text-3xl font-bold mt-2 text-text-primary">{occurrences.length}</p>
          <p className="text-sm text-text-secondary">キャンセル含む</p>
        </Card>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <FixedRecurringForm
          categories={categories}
          processing={processing || loadingCategories}
          editing={editing}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditing(null)}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">テンプレート一覧</h2>
            {editing ? (
              <span className="text-xs text-primary font-semibold flex items-center gap-1">
                <span className="material-icons text-base">edit</span>
                編集モード
              </span>
            ) : null}
          </div>
          <FixedRecurringList
            entries={entries}
            loading={loading}
            onEdit={(entry) => setEditing(entry)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <OccurrenceBoard
        occurrences={occurrences}
        selectedMonth={selectedMonth}
        stats={stats}
        loading={loading}
        error={error}
        onMonthChange={setSelectedMonth}
        onRetry={refreshAll}
      />
    </div>
  );
};

export default FixedRecurringPage;
