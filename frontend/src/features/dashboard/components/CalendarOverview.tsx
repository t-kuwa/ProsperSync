import { useMemo, useState } from "react";
import type { FinancialEntry } from "../hooks/useDashboardState";
import formatCurrency from "../utils/formatCurrency";

type CalendarOverviewProps = {
  entries: FinancialEntry[];
  className?: string;
  title?: string;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

const CalendarOverview = ({
  entries,
  className,
  title = "カレンダー",
}: CalendarOverviewProps) => {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthKey = `${visibleMonth.getFullYear()}-${String(
    visibleMonth.getMonth() + 1,
  ).padStart(2, "0")}`;

  const entriesByDate = useMemo(() => {
    return entries.reduce<Record<string, { income: number; expense: number }>>(
      (acc, entry) => {
        const key = entry.date;
        if (!acc[key]) {
          acc[key] = { income: 0, expense: 0 };
        }

        if (entry.type === "income") {
          acc[key].income += entry.amount;
        } else {
          acc[key].expense += entry.amount;
        }

        return acc;
      },
      {},
    );
  }, [entries]);

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
                {hasData ? (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                    活動あり
                  </span>
                ) : null}
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
    </div>
  );
};

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default CalendarOverview;
