import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import type { CalendarEntry, MonthlyStat } from "../types";
import "../../../lib/registerCharts";
import { getExpenses } from "../../../api/expenses";
import { getIncomes } from "../../../api/incomes";
import { getErrorMessage } from "../../../api/client";
import BottomSheet from "./BottomSheet";
import DateTransactionList, { type DayTransaction } from "./DateTransactionList";
import { Card } from "../../../components/ui/Card";

type CalendarOverviewProps = {
  calendarEntries: CalendarEntry[];
  monthlyBreakdown?: MonthlyStat[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  showTrendChart?: boolean;
  accountId?: number;
};

type DayDetails = {
  incomes: DayTransaction[];
  expenses: DayTransaction[];
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

const CalendarOverview = ({
  calendarEntries,
  monthlyBreakdown = [],
  loading = false,
  error = null,
  onRetry,
  className,
  showTrendChart = true,
  accountId,
}: CalendarOverviewProps) => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [dayDetails, setDayDetails] = useState<DayDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, DayDetails>>({});
  const calendarRef = useRef<HTMLDivElement | null>(null);

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

  const trendChartData = useMemo(
    () => ({
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
    }),
    [monthlyBreakdown],
  );

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
          key: string;
        }
      | null
    > = [];

    for (let i = 0; i < leadingDays; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const current = new Date(year, month, day);
      cells.push({
        date: current,
        key: toDateKey(current),
      });
    }

    for (let i = 0; i < trailingDays; i += 1) {
      cells.push(null);
    }

    return cells;
  }, [visibleMonth]);

  const fetchDayDetails = useCallback(
    async (dateKey: string) => {
      if (!accountId) {
        setDayDetails(null);
        setDetailsError("アカウントが選択されていません。");
        setDetailsLoading(false);
        return;
      }

      setDetailsLoading(true);
      setDetailsError(null);

      try {
        const [expenses, incomes] = await Promise.all([
          getExpenses(accountId, { startDate: dateKey, endDate: dateKey }),
          getIncomes(accountId, { startDate: dateKey, endDate: dateKey }),
        ]);

        const mapped: DayDetails = {
          expenses: expenses.map((expense) => ({
            id: expense.id,
            title: expense.title,
            amount: expense.amount,
            category: expense.category?.name ?? "未分類",
            type: "expense",
            color: expense.category?.color ?? null,
          })),
          incomes: incomes.map((income) => ({
            id: income.id,
            title: income.title,
            amount: income.amount,
            category: income.category?.name ?? "未分類",
            type: "income",
            color: income.category?.color ?? null,
          })),
        };

        setDetailsCache((prev) => ({ ...prev, [dateKey]: mapped }));
        setDayDetails(mapped);
      } catch (err) {
        setDetailsError(getErrorMessage(err));
        setDayDetails(null);
      } finally {
        setDetailsLoading(false);
      }
    },
    [accountId],
  );

  const handleDateClick = (dateKey: string) => {
    const data = entriesByDate[dateKey];
    const hasDataForDate = data ? data.income > 0 || data.expense > 0 : false;

    if (!hasDataForDate) {
      setIsBottomSheetOpen(false);
      setSelectedDate(null);
      return;
    }

    if (selectedDate === dateKey && isBottomSheetOpen) {
      setIsBottomSheetOpen(false);
      setSelectedDate(null);
      return;
    }

    setSelectedDate(dateKey);
    setIsBottomSheetOpen(true);
    setDetailsError(null);

    if (detailsCache[dateKey]) {
      setDayDetails(detailsCache[dateKey]);
      return;
    }

    void fetchDayDetails(dateKey);
  };

  useEffect(() => {
    if (!isBottomSheetOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsBottomSheetOpen(false);
        setSelectedDate(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBottomSheetOpen]);

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedDate(null);
  };

  const selectedSummary =
    (selectedDate ? entriesByDate[selectedDate] : undefined) ?? {
      income: 0,
      expense: 0,
    };

  const selectedDateLabel = selectedDate
    ? formatDateToJapanese(selectedDate)
    : "";

  return (
    <Card className={`p-6 flex flex-col ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{monthKey}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-border px-3 py-1 text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary"
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
            className="rounded-full border border-border px-3 py-1 text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary"
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

      <div className="-mx-6 mt-6 grid grid-cols-7 gap-0 px-0 text-center text-xs font-semibold uppercase tracking-wide text-text-secondary opacity-70">
        {weekdays.map((weekday) => (
          <span key={weekday} className="py-2">
            {weekday}
          </span>
        ))}
      </div>

      <div
        ref={calendarRef}
        className="-mx-6 mt-2 grid grid-cols-7 gap-0 px-0 text-xs"
      >
        {calendar.map((cell, index) => {
          if (!cell) {
            return (
              <div key={`empty-${index}`} className="h-14 min-h-[56px] md:h-20 md:min-h-[80px]" aria-hidden />
            );
          }

          const { key, date } = cell;
          const data = entriesByDate[key];
          const hasData = data ? data.income > 0 || data.expense > 0 : false;
          const isToday = key === toDateKey(new Date());
          const canInteract = hasData && Boolean(accountId);

          return (
            <div
              key={key}
              role={canInteract ? "button" : undefined}
              tabIndex={canInteract ? 0 : -1}
              className={`flex h-14 min-h-[56px] md:h-20 md:min-h-[80px] flex-col justify-between rounded-xl md:rounded-2xl border border-transparent p-1 md:p-3 text-left transition ${
                canInteract
                  ? "cursor-pointer hover:border-primary/30 hover:bg-surface"
                  : "cursor-default opacity-60"
              } ${
                isToday ? "border-primary/30 bg-primary/5" : ""
              } ${hasData ? "" : ""}`}
              onClick={
                hasData
                  ? canInteract
                    ? () => {
                        handleDateClick(key);
                      }
                    : undefined
                  : () => {
                      setIsBottomSheetOpen(false);
                      setSelectedDate(null);
                    }
              }
              onKeyDown={
                canInteract
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleDateClick(key);
                      }
                    }
                  : undefined
              }
            >
              <div className={`flex items-center justify-center text-xs font-semibold ${isToday ? "text-primary" : "text-text-secondary"}`}>
                <span>{date.getDate()}</span>
              </div>
              <div className="space-y-0.5 text-right">
                <div className="flex min-h-[14px] flex-col gap-0.5 text-[7px] font-semibold md:hidden">
                  {data?.income ? (
                    <div className="text-emerald-600">
                      {formatCompactCurrency(data.income)}
                    </div>
                  ) : null}
                  {data?.expense ? (
                    <div className="text-rose-600">
                      {formatCompactCurrency(data.expense)}
                    </div>
                  ) : null}
                </div>
                <div className="hidden min-h-[20px] flex-col space-y-0.5 text-[10px] font-semibold md:flex">
                  {data?.income ? (
                    <div className="text-emerald-600">
                      {formatCompactCurrency(data.income)}
                    </div>
                  ) : null}
                  {data?.expense ? (
                    <div className="text-rose-600">
                      {formatCompactCurrency(data.expense)}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-6 animate-pulse rounded-2xl bg-surface py-10 text-center text-sm text-text-secondary">
          カレンダーデータを読み込んでいます…
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl bg-red-50 px-4 py-6 text-center text-sm text-red-600">
          {error}
          {onRetry ? (
            <div>
              <button
                type="button"
                className="mt-3 rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
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

      <BottomSheet
        isOpen={isBottomSheetOpen && Boolean(selectedDate)}
        onClose={closeBottomSheet}
        title="日別の収支"
      >
        {selectedDate ? (
          <DateTransactionList
            dateLabel={selectedDateLabel}
            incomes={dayDetails?.incomes ?? []}
            expenses={dayDetails?.expenses ?? []}
            summary={selectedSummary}
            loading={detailsLoading && Boolean(accountId)}
            error={detailsError}
            onRetry={
              selectedDate
                ? () => {
                    void fetchDayDetails(selectedDate);
                  }
                : undefined
            }
          />
        ) : null}
      </BottomSheet>
    </Card>
  );
};

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatCompactCurrency = (amount: number): string => {
  return amount.toLocaleString("ja-JP");
};

const formatDateToJapanese = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export default CalendarOverview;
