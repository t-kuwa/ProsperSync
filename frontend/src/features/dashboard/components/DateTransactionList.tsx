import formatCurrency from "../utils/formatCurrency";

export type DayTransaction = {
  id: number;
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  color?: string | null;
};

type DateTransactionListProps = {
  dateLabel: string;
  incomes: DayTransaction[];
  expenses: DayTransaction[];
  summary: {
    income: number;
    expense: number;
  };
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
};

const DateTransactionList = ({
  dateLabel,
  incomes,
  expenses,
  summary,
  loading,
  error,
  onRetry,
}: DateTransactionListProps) => {
  const totalCount = incomes.length + expenses.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-400">
          {dateLabel} のデータを読み込んでいます…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 text-center text-sm text-rose-600">
        <p>{error}</p>
        {onRetry ? (
          <button
            type="button"
            className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            onClick={() => {
              void onRetry();
            }}
          >
            再試行
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-text-secondary">
          {dateLabel}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          <span className="rounded-full bg-green-50 px-3 py-1 text-green-600">
            収入 {formatCurrency(summary.income)}
          </span>
          <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">
            支出 {formatCurrency(summary.expense)}
          </span>
          <span className="text-xs text-text-secondary opacity-70">合計 {totalCount} 件</span>
        </div>
      </header>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-green-500">
          収入
        </h3>
        {incomes.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-xs text-text-secondary">
            この日には収入がありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {incomes.map((item) => (
              <TransactionRow key={`income-${item.id}`} transaction={item} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-red-500">
          支出
        </h3>
        {expenses.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-xs text-text-secondary">
            この日には支出がありません。
          </p>
        ) : (
          <ul className="space-y-2">
            {expenses.map((item) => (
              <TransactionRow key={`expense-${item.id}`} transaction={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const TransactionRow = ({ transaction }: { transaction: DayTransaction }) => (
  <li className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 border border-border">
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-text-primary">
        {transaction.title}
      </p>
      <p className="text-xs text-text-secondary">
        <span
          className="mr-2 inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: transaction.color ?? "#cbd5f5" }}
        />
        {transaction.category}
      </p>
    </div>
    <span
      className={`text-sm font-semibold ${
        transaction.type === "income" ? "text-green-600" : "text-red-600"
      }`}
    >
      {transaction.type === "income" ? "+" : "-"}
      {formatCurrency(transaction.amount).replace("￥", "")}
    </span>
  </li>
);

export default DateTransactionList;
