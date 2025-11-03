import { useMemo } from "react";
import type { AppRoute } from "../../routes";
import CalendarOverview from "./components/CalendarOverview";
import DashboardShell from "./components/DashboardShell";
import FinancialOverview from "./components/FinancialOverview";
import InsightsPanel from "./components/InsightsPanel";
import SummaryCards from "./components/SummaryCards";
import useDashboardState, {
  type FinancialEntry,
} from "./hooks/useDashboardState";
import formatCurrency from "./utils/formatCurrency";

type DashboardPageProps = {
  onLogout?: () => void;
  userName?: string;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const DashboardPage = ({
  onLogout,
  userName,
  currentRoute,
  onNavigate,
}: DashboardPageProps) => {
  const {
    totals,
    netCashflow,
    runRate,
    growthRatio,
    inflowOutflowRatio,
    totalAccountBalance,
    entries,
    recentEntries,
  } = useDashboardState();

  const summaryCards = useMemo(
    () => [
      {
        title: "今月の収入",
        value: formatCurrency(totals.income),
        trendLabel: "先月比",
        trendValue: "+12.4%",
        trendPositive: true,
      },
      {
        title: "今月の支出",
        value: formatCurrency(totals.expense),
        trendLabel: "先月比",
        trendValue: "+4.8%",
        trendPositive: false,
      },
      {
        title: "キャッシュフロー",
        value: formatCurrency(netCashflow),
        trendLabel: "支出比率",
        trendValue: `${Math.abs(Math.round(growthRatio))}%`,
        trendPositive: growthRatio >= 0,
      },
      {
        title: "推定ランレート",
        value: formatCurrency(runRate),
        trendLabel: "四半期見込み",
        trendValue: "+8.9%",
        trendPositive: true,
      },
    ],
    [totals.income, totals.expense, netCashflow, runRate, growthRatio],
  );

  const headerActions = (
    <>
      <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
        <span className="text-lg">🔍</span>
        <input
          placeholder="検索（取引 / アカウント / メンバー）"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:w-72"
        />
      </div>
      <button
        type="button"
        className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
      >
        新規レポートを作成
      </button>
    </>
  );

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="ダッシュボード概要"
      headerActions={headerActions}
    >
      <div className="flex flex-col gap-6">
        <SummaryCards cards={summaryCards} />

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-stretch">
          <CalendarOverview
            entries={entries}
            className="xl:col-span-2 h-fit"
            title="スケジュール"
          />
          <InsightsPanel
            inflowOutflowRatio={inflowOutflowRatio}
            totalAccountBalance={totalAccountBalance}
            className="xl:col-span-1 h-full"
          />
        </section>

        <FinancialOverview
          entries={entries}
          className="w-full"
        />

        <div className="h-full">
          <RecentTransactions entries={recentEntries} />
        </div>
      </div>
    </DashboardShell>
  );
};

type RecentTransactionsProps = {
  entries: FinancialEntry[];
};

const RecentTransactions = ({ entries }: RecentTransactionsProps) => (
  <div className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">
        最近のトランザクション
      </h2>
      <span className="text-xs font-medium text-indigo-600">
        過去6件を表示
      </span>
    </div>
    <ul className="mt-4 space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-slate-900">
              {entry.category}
            </p>
            <p className="text-xs text-slate-500">
              {entry.date}・{entry.note ?? "メモなし"}
            </p>
          </div>
          <span
            className={`text-sm font-semibold ${
              entry.type === "income" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {entry.type === "income" ? "+" : "-"}
            {formatCurrency(entry.amount).replace("￥", "")}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default DashboardPage;
