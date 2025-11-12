import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import type { CalendarEntry, MonthlyStat } from "../types";
import "../../../lib/registerCharts";
import formatCurrency from "../utils/formatCurrency";

type CalendarOverviewProps = {
  calendarEntries: CalendarEntry[];
  monthlyBreakdown?: MonthlyStat[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  title?: string;
  showTrendChart?: boolean;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

const CalendarOverview = ({
  calendarEntries,
  monthlyBreakdown = [],
  loading = false,
  error = null,
  onRetry,
  className,
  title = "カレンダー",
  showTrendChart = true,
}: CalendarOverviewProps) => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthKey = `${visibleMonth.getFullYear()}-${String(
    visibleMonth.getMonth() + 1,
  ).padStart(2, "0")}`;

  const entriesByDate = useMemo(() => {
    const monthPrefix = monthKey;
    return calendarEntries
      .filter((entry) => entry.date.startsWith(monthPrefix))
      .reduce<Record<string, { income: number; expense: number }>>(
        (acc, entry) => {
          if (!acc[entry.date]) {
            acc[entry.date] = { income: 0, expense: 0 };
          }
          acc[entry.date].income += entry.income;
          acc[entry.date].expense += entry.expense;
          return acc;
        },
        {},
      );
  }, [calendarEntries, monthKey]);

  const trendChartData = useMemo(() => ({
    labels: monthlyBreakdown.map((month) => month.label),
    datasets: [
      {
        label: "収入",
        data: monthlyBreakdown.map((month) => month.income),
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "支出",
        data: monthlyBreakdown.map((month) => month.expense),
        borderColor: "rgba(244, 63, 94, 1)",
        backgroundColor: "rgba(244, 63, 94, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }), [monthlyBreakdown]);

  const calendar = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const leadingDays = firstDay.getDay();
    const trailingDays = (7 - ((leadingDays + daysInMonth) % 7)) % 7;

    const cells: Array<
      | {
          date: Date;
          inCurrentMonth: boolean;
          key: string;
        }
      | null
    > = [];

    for (let i = 0; i < leadingDays; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const current = new Date(year, month, day);
      const key = toDateKey(current);
      cells.push({
        date: current,
        inCurrentMonth: true,
        key,
      });
    }

    for (let i = 0; i < trailingDays; i += 1) {
      cells.push(null);
    }

    return cells;
  }, [visibleMonth]);

  return (
    <div
      className={`flex h-fit flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">
            {monthKey} の収支スケジュール
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            onClick={() =>
              setVisibleMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
              )
            }
            aria-label="前の月"
          >
            ←
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            onClick={() =>
              setVisibleMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
              )
            }
            aria-label="次の月"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
        {weekdays.map((weekday) => (
          <span key={weekday} className="py-2">
            {weekday}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2 text-xs">
        {calendar.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="py-6" />;
          }

          const { key, date } = cell;
          const data = entriesByDate[key];
          const hasData = Boolean(data);
          const isToday = key === toDateKey(new Date());

          return (
            <div
              key={key}
              className={`flex flex-col gap-1 rounded-2xl border border-transparent p-3 text-left transition hover:border-indigo-200 ${
                isToday ? "border-indigo-200 bg-indigo-50/70" : "bg-slate-50"
              } ${hasData ? "shadow-sm shadow-indigo-50" : ""}`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{date.getDate()}</span>
              </div>
              {hasData ? (
                <div className="space-y-1 text-[11px]">
                  {data.income ? (
                    <div className="flex items-center justify-between rounded-lg bg-white px-2 py-1 text-emerald-600">
                      <span>収入</span>
                      <span>{formatCurrency(data.income).replace("￥", "")}</span>
                    </div>
                  ) : null}
                  {data.expense ? (
                    <div className="flex items-center justify-between rounded-lg bg-white px-2 py-1 text-rose-600">
                      <span>支出</span>
                      <span>{formatCurrency(data.expense).replace("￥", "")}</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-4 text-[10px] text-slate-300">
                  予定なし
                </p>
              )}
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-6 animate-pulse rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-400">
          カレンダーデータを読み込んでいます…
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-6 text-center text-sm text-rose-600">
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
      ) : null}

      {showTrendChart && monthlyBreakdown.length ? (
        <div className="mt-6 h-48" role="img" aria-label="月次収支トレンド">
          <Line
            data={trendChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "bottom" },
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
                  grid: { color: "rgba(226, 232, 240, 0.5)" },
                  ticks: {
                    color: "#94a3b8",
                    callback: (value) => `¥${Number(value).toLocaleString("ja-JP")}`,
                  },
                },
              },
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default CalendarOverview;
