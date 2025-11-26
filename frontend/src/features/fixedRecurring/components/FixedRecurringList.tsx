import { useMemo } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import formatCurrency from "../../dashboard/utils/formatCurrency";
import type { FixedRecurringEntry } from "../types";

type FixedRecurringListProps = {
  entries: FixedRecurringEntry[];
  loading: boolean;
  onEdit: (entry: FixedRecurringEntry) => void;
  onDelete: (entry: FixedRecurringEntry) => void;
};

const formatPeriod = (entry: FixedRecurringEntry) => {
  const start = entry.effectiveFrom?.slice(0, 7);
  const end = entry.effectiveTo ? entry.effectiveTo.slice(0, 7) : "制限なし";
  return `${start} → ${end}`;
};

const FixedRecurringList = ({
  entries,
  loading,
  onEdit,
  onDelete,
}: FixedRecurringListProps) => {
  const sortedEntries = useMemo(
    () =>
      [...entries].sort((a, b) =>
        a.effectiveFrom.localeCompare(b.effectiveFrom),
      ),
    [entries],
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-text-secondary">
          <span className="material-icons animate-spin text-primary">progress_activity</span>
          読み込み中...
        </div>
      </Card>
    );
  }

  if (!sortedEntries.length) {
    return (
      <Card className="p-6 text-center text-text-secondary border-dashed border-2 border-border/60">
        <p className="text-base font-semibold text-text-primary">固定収支を登録しましょう</p>
        <p className="text-sm mt-1">家賃やサブスクなど、毎月決まった収支をここで管理できます。</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {sortedEntries.map((entry) => (
        <Card
          key={entry.id}
          className="p-5 border border-border/80 hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    entry.kind === "income"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {entry.kind === "income" ? "収入" : "支出"}
                </span>
                <p className="text-xs text-text-secondary">
                  発生日: 毎月 {entry.useEndOfMonth ? `${entry.dayOfMonth}日（短い月は月末）` : `${entry.dayOfMonth}日固定`}
                </p>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                {entry.title}
              </h3>
              <p className="text-sm text-text-secondary">
                {entry.category?.name ?? "カテゴリ未設定"} · {formatPeriod(entry)}
              </p>
              {entry.memo ? (
                <p className="text-sm text-text-secondary">{entry.memo}</p>
              ) : null}
            </div>

            <div className="text-right space-y-2">
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(entry.amount)}
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(entry)}
                  className="h-9"
                >
                  <span className="material-icons text-base mr-1">edit</span>
                  編集
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(entry)}
                  className="h-9 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <span className="material-icons text-base mr-1">delete</span>
                  削除
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FixedRecurringList;
