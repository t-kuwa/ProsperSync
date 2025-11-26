import { useMemo } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import formatCurrency from "../../dashboard/utils/formatCurrency";
import type {
  FixedRecurringEntry,
  FixedRecurringEntryOccurrence,
  FixedRecurringStats,
} from "../types";

type OccurrenceBoardProps = {
  occurrences: FixedRecurringEntryOccurrence[];
  selectedMonth: string;
  stats: FixedRecurringStats;
  loading: boolean;
  error: string | null;
  onMonthChange: (month: string) => void;
  onRetry: () => void;
};

const statusColor = (status: FixedRecurringEntryOccurrence["status"]) => {
  switch (status) {
    case "applied":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "canceled":
      return "bg-amber-50 text-amber-700 border-amber-100";
    default:
      return "bg-primary/10 text-primary border-primary/10";
  }
};

const statusLabel = (status: FixedRecurringEntryOccurrence["status"]) => {
  if (status === "applied") return "適用済み";
  if (status === "canceled") return "キャンセル";
  return "予定";
};

const OccurrenceBoard = ({
  occurrences,
  selectedMonth,
  stats,
  loading,
  error,
  onMonthChange,
  onRetry,
}: OccurrenceBoardProps) => {
  const monthLabel = useMemo(() => {
    if (!selectedMonth) return "";
    const [y, m] = selectedMonth.split("-");
    return `${y}年${m}月`;
  }, [selectedMonth]);

  const sorted = useMemo(
    () =>
      [...occurrences].sort((a, b) => a.occursOn.localeCompare(b.occursOn)),
    [occurrences],
  );

  return (
    <Card className="p-6 border border-white/70">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">Monthly Roll</p>
          <h3 className="text-xl font-semibold text-text-primary">今月の固定収支</h3>
          <p className="text-sm text-text-secondary">{monthLabel} の発生日一覧</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
          />
          <Button variant="ghost" size="sm" onClick={onRetry} disabled={loading}>
            <span className="material-icons text-base mr-1">refresh</span>
            再読み込み
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold">収入予定</p>
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(stats.incomeTotal)}
          </p>
          <p className="text-xs text-text-secondary">今月の固定収入合計</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-white border-red-100">
          <p className="text-xs text-red-600 font-semibold">支出予定</p>
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(stats.expenseTotal)}
          </p>
          <p className="text-xs text-text-secondary">今月の固定支出合計</p>
        </Card>
        <Card className="p-4 border-border/60">
          <p className="text-xs text-primary font-semibold">ステータス</p>
          <div className="text-sm text-text-secondary space-y-1 mt-1">
            <div className="flex items-center justify-between">
              <span>予定 (scheduled)</span>
              <span className="font-semibold text-text-primary">{stats.scheduledCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>適用済み (applied)</span>
              <span className="font-semibold text-text-primary">{stats.appliedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>キャンセル (canceled)</span>
              <span className="font-semibold text-text-primary">{stats.canceledCount}</span>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border/60">
          <p className="text-xs text-primary font-semibold">ヒント</p>
          <p className="text-sm text-text-secondary mt-1">
            月を切り替えると、適用済みは残しつつ期間外はキャンセルで保持されます。
          </p>
        </Card>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={onRetry}>
            再試行
          </Button>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-text-secondary">
            <span className="material-icons animate-spin text-primary">progress_activity</span>
            ローディング中...
          </div>
        ) : null}

        {!loading && !sorted.length ? (
          <div className="rounded-2xl border border-dashed border-border/70 px-4 py-6 text-center text-text-secondary">
            この月の固定収支はまだありません。
          </div>
        ) : null}

        {sorted.map((occurrence) => {
          const entry = occurrence.fixedRecurringEntry as FixedRecurringEntry | undefined;
          return (
            <div
              key={occurrence.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(occurrence.status)}`}
                >
                  {statusLabel(occurrence.status)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {entry?.title ?? "名称未設定"}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {occurrence.occursOn} · {entry?.category?.name ?? "カテゴリ未設定"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    entry?.kind === "income" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {entry ? formatCurrency(entry.amount) : "-"}
                </p>
                {occurrence.appliedAt ? (
                  <p className="text-xs text-text-secondary">applied at {occurrence.appliedAt}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default OccurrenceBoard;
