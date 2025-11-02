import { useMemo } from "react";
import type { FinancialEntry } from "../../dashboard/hooks/useDashboardState";
import formatCurrency from "../../dashboard/utils/formatCurrency";

type TransactionListProps = {
  entries: FinancialEntry[];
};

const TransactionList = ({ entries }: TransactionListProps) => {
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        if (entry.type === "income") {
          acc.income += entry.amount;
        } else {
          acc.expense += entry.amount;
        }

        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [entries]);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">取引履歴</h2>
          <p className="text-sm text-slate-500">
            全ての収入と支出を時系列で確認
          </p>
        </div>
        <div className="flex gap-3 text-xs font-medium">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            総収入 {formatCurrency(totals.income)}
          </span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">
            総支出 {formatCurrency(totals.expense)}
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-3 py-2">日付</th>
              <th className="px-3 py-2">カテゴリ</th>
              <th className="px-3 py-2">種別</th>
              <th className="px-3 py-2 text-right">金額</th>
              <th className="px-3 py-2">メモ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50/60">
                <td className="px-3 py-3">{entry.date}</td>
                <td className="px-3 py-3 font-medium text-slate-900">
                  {entry.category}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      entry.type === "income"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {entry.type === "income" ? "収入" : "支出"}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-semibold">
                  {entry.type === "income" ? "+" : "-"}
                  {formatCurrency(entry.amount).replace("￥", "")}
                </td>
                <td className="px-3 py-3 text-slate-500">
                  {entry.note ?? "メモなし"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
