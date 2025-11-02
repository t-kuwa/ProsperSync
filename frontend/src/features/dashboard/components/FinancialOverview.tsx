import { useMemo } from "react";
import type { FinancialEntry } from "../hooks/useDashboardState";
import formatCurrency from "../utils/formatCurrency";

type FinancialOverviewProps = {
  entries: FinancialEntry[];
  className?: string;
};

const FinancialOverview = ({ entries, className }: FinancialOverviewProps) => (
  <div
    className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className ?? ""}`}
  >
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">収支の推移</h2>
      <button
        type="button"
        className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
      >
        月別を見る
      </button>
    </div>
    <p className="mt-1 text-sm text-slate-500">
      最新のデータから推計した月次トレンド
    </p>

    <TrendChart entries={entries} />
  </div>
);

type TrendChartProps = {
  entries: FinancialEntry[];
};

const TrendChart = ({ entries }: TrendChartProps) => {
  const monthly = useMemo(() => {
    const result: Record<
      string,
      {
        income: number;
        expense: number;
      }
    > = {};

    entries.forEach((entry) => {
      const month = entry.date.slice(0, 7);
      if (!result[month]) {
        result[month] = { income: 0, expense: 0 };
      }

      if (entry.type === "income") {
        result[month].income += entry.amount;
      } else {
        result[month].expense += entry.amount;
      }
    });

    return Object.entries(result)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-6);
  }, [entries]);

  if (!monthly.length) {
    return (
      <div className="mt-8 rounded-2xl bg-slate-50 py-12 text-center text-sm text-slate-500">
        データがまだありません。収入または支出を追加すると推移が表示されます。
      </div>
    );
  }

  const maxValue = Math.max(
    ...monthly.flatMap(([, values]) => [values.income, values.expense]),
  );

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-indigo-500" />
          <span>収入</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          <span>支出</span>
        </div>
      </div>
      <div className="flex items-end gap-6">
        {monthly.map(([month, values]) => {
          const incomeHeight = maxValue === 0 ? 0 : (values.income / maxValue) * 180;
          const expenseHeight =
            maxValue === 0 ? 0 : (values.expense / maxValue) * 180;

          return (
            <div key={month} className="flex flex-1 flex-col items-center gap-3">
              <div className="flex h-48 w-full items-end justify-center gap-2 rounded-2xl bg-slate-50 px-3 pb-3">
                <div
                  className="w-3 rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ height: `${incomeHeight || 4}px` }}
                  title={`${month} 収入: ${formatCurrency(values.income)}`}
                />
                <div
                  className="w-3 rounded-full bg-rose-500 transition-all duration-500"
                  style={{ height: `${expenseHeight || 4}px` }}
                  title={`${month} 支出: ${formatCurrency(values.expense)}`}
                />
              </div>
              <span className="text-xs font-medium text-slate-500">
                {month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialOverview;
