import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { MonthlyStat } from "../types";
import "../../../lib/registerCharts";
import { Card } from "../../../components/ui/Card";

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
    <Card className={`p-6 h-full flex flex-col ${className ?? ""}`} aria-busy={loading} aria-live="polite">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">収支の推移</h2>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
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
      <p className="text-sm text-text-secondary mb-6">
        過去6ヶ月の月次データを可視化しています。
      </p>

      {loading ? (
        <div className="flex-1 flex items-center justify-center animate-pulse rounded-2xl bg-surface py-16 text-center text-sm text-text-secondary">
          データを読み込んでいます…
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-red-50 px-4 py-6 text-center text-sm text-red-600">
          {error}
          {onRetry ? (
            <button
              type="button"
              className="mt-3 rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
              onClick={() => {
                void onRetry();
              }}
            >
              再試行
            </button>
          ) : null}
        </div>
      ) : hasData ? (
        <div className="flex-1 min-h-[300px]" role="img" aria-label="過去6ヶ月の収支推移">
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
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  titleColor: "#1e293b",
                  bodyColor: "#475569",
                  borderColor: "#e2e8f0",
                  borderWidth: 1,
                  padding: 12,
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
        <div className="flex-1 flex items-center justify-center rounded-2xl bg-surface py-12 text-center text-sm text-text-secondary">
          データがまだありません。収入または支出を追加すると推移が表示されます。
        </div>
      )}
    </Card>
  );
};

export default FinancialOverview;
