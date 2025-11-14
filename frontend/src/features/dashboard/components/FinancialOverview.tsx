import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { MonthlyStat } from "../types";
import "../../../lib/registerCharts";

type FinancialOverviewProps = {
  monthlyBreakdown: MonthlyStat[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
};

const FinancialOverview = ({
  monthlyBreakdown,
  loading = false,
  error = null,
  onRetry,
  className,
}: FinancialOverviewProps) => {
  const chartData = useMemo(() => {
    const labels = monthlyBreakdown.map((month) => month.label);
    const incomeData = monthlyBreakdown.map((month) => month.income);
    const expenseData = monthlyBreakdown.map((month) => month.expense);

    return {
      labels,
      datasets: [
        {
          label: "収入",
          data: incomeData,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderRadius: 12,
          borderSkipped: false,
        },
        {
          label: "支出",
          data: expenseData,
          backgroundColor: "rgba(244, 63, 94, 0.7)",
          borderRadius: 12,
          borderSkipped: false,
        },
      ],
    };
  }, [monthlyBreakdown]);

  const hasData = monthlyBreakdown.length > 0;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-xl shadow-slate-900/10 ring-1 ring-white/60 ${className ?? ""}`}
      aria-busy={loading}
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/35 blur-3xl"
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">収支の推移</h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            収入
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden />
            支出
          </span>
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        過去6ヶ月の月次データをChart.jsで可視化しています。
      </p>

      {loading ? (
        <div className="mt-8 animate-pulse rounded-2xl bg-slate-50 py-16 text-center text-sm text-slate-400">
          データを読み込んでいます…
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl bg-rose-50 px-4 py-6 text-center text-sm text-rose-600">
          {error}
          {onRetry ? (
            <div>
              <button
                type="button"
                className="mt-3 rounded-full border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                onClick={() => {
                  void onRetry();
                }}
              >
                再試行
              </button>
            </div>
          ) : null}
        </div>
      ) : hasData ? (
        <div className="mt-8 h-72" role="img" aria-label="過去6ヶ月の収支推移">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { intersect: false, mode: "index" },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const value = context.parsed.y ?? 0;
                      return `${context.dataset.label}: ¥${value.toLocaleString("ja-JP")}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: "#94a3b8" },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: "rgba(226, 232, 240, 0.6)" },
                  ticks: {
                    color: "#94a3b8",
                    callback: (value) => `¥${Number(value).toLocaleString("ja-JP")}`,
                  },
                },
              },
            }}
            aria-label="収支の棒グラフ"
          />
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-slate-50 py-12 text-center text-sm text-slate-500">
          データがまだありません。収入または支出を追加すると推移が表示されます。
        </div>
      )}
    </div>
  );
};

export default FinancialOverview;
