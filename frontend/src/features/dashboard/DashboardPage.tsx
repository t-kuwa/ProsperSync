import { useMemo } from "react";
import type { AppRoute } from "../../routes";
import CalendarOverview from "./components/CalendarOverview";
import DashboardShell from "./components/DashboardShell";
import FinancialOverview from "./components/FinancialOverview";
import InsightsPanel from "./components/InsightsPanel";
import SummaryCards from "./components/SummaryCards";
import BudgetHighlights from "./components/BudgetHighlights";
import useDashboardState from "./hooks/useDashboardState";
import type { FinancialEntry } from "./types";
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
    stats,
    loading,
    error,
    refresh,
    currentTotals,
    previousTotals,
    netCashflow,
    runRate,
    inflowOutflowRatio,
    recentEntries,
    monthlyBreakdown,
    calendarEntries,
    balance,
    budgetSummary,
  } = useDashboardState();

  const totalAccountBalance = balance.net;

  const previousNet = previousTotals.income - previousTotals.expense;

  const formatTrend = (
    current: number,
    previous: number,
    preferPositiveOnDecrease = false,
  ) => {
    if (previous === 0) {
      const positive = preferPositiveOnDecrease ? current <= previous : current >= previous;
      return {
        value: current === 0 ? "0%" : "+100%",
        positive,
      };
    }

    const change = ((current - previous) / previous) * 100;
    const positive = preferPositiveOnDecrease ? change <= 0 : change >= 0;
    const value = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    return { value, positive };
  };

  const incomeTrend = formatTrend(currentTotals.income, previousTotals.income);
  const expenseTrend = formatTrend(currentTotals.expense, previousTotals.expense, true);
  const cashflowTrend = formatTrend(netCashflow, previousNet);
  const averageMonthlyNet =
    monthlyBreakdown.length > 0
      ? monthlyBreakdown.reduce(
          (acc, item) => acc + (item.income - item.expense),
          0,
        ) / monthlyBreakdown.length
      : 0;

  const summaryCards = useMemo(
    () => [
      {
        title: "キャッシュフロー",
        value: formatCurrency(netCashflow),
        trendLabel: "先月比",
        trendValue: cashflowTrend.value,
        trendPositive: cashflowTrend.positive,
      },
      {
        title: "今月の収入",
        value: formatCurrency(currentTotals.income),
        trendLabel: "先月比",
        trendValue: incomeTrend.value,
        trendPositive: incomeTrend.positive,
      },
      {
        title: "今月の支出",
        value: formatCurrency(currentTotals.expense),
        trendLabel: "先月比",
        trendValue: expenseTrend.value,
        trendPositive: expenseTrend.positive,
      },
      {
        title: "推定ランレート",
        value: formatCurrency(runRate),
        trendLabel: "平均月次ネット",
        trendValue: formatCurrency(averageMonthlyNet),
        trendPositive: averageMonthlyNet >= 0,
      },
      {
        title: "予算の進捗",
        value: formatCurrency(budgetSummary.totalSpent),
        trendLabel: `予算 ${formatCurrency(budgetSummary.totalBudget)}`,
        trendValue:
          budgetSummary.overruns > 0
            ? `${budgetSummary.overruns} 件超過`
            : "順調です",
        trendPositive: budgetSummary.overruns === 0,
      },
    ],
    [
      currentTotals.income,
      currentTotals.expense,
      netCashflow,
      runRate,
      incomeTrend.value,
      incomeTrend.positive,
      expenseTrend.value,
      expenseTrend.positive,
      cashflowTrend.value,
      cashflowTrend.positive,
      averageMonthlyNet,
      budgetSummary.totalSpent,
      budgetSummary.totalBudget,
      budgetSummary.overruns,
    ],
  );

  const visibleSummaryCards = useMemo(
    () => summaryCards.filter((card) => card.title !== "推定ランレート"),
    [summaryCards],
  );

  const renderContent = () => {
    if (!stats && loading) {
      return (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
          ダッシュボードデータを読み込んでいます…
        </div>
      );
    }

    if (error && !stats) {
      return (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-rose-100">
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
            onClick={() => {
              void refresh();
            }}
          >
            もう一度試す
          </button>
        </div>
      );
    }

    if (!stats) {
      return (
        <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
          まだ収支データがありません。トランザクションを追加するとダッシュボードが更新されます。
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <SummaryCards cards={visibleSummaryCards} />

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-stretch">
          <div className="xl:col-span-2 h-full">
            <CalendarOverview
              accountId={stats.account.id}
              calendarEntries={calendarEntries}
              monthlyBreakdown={monthlyBreakdown}
              loading={loading}
              error={error}
              onRetry={refresh}
              className="h-full"
            />
          </div>
          <div className="flex h-full flex-col gap-4 xl:col-span-1">
            <InsightsPanel
              inflowOutflowRatio={inflowOutflowRatio}
              totalAccountBalance={totalAccountBalance}
              className="h-full"
            />
            <BudgetHighlights summary={budgetSummary} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-stretch">
          <div className="xl:col-span-2 h-full">
            <FinancialOverview
              monthlyBreakdown={monthlyBreakdown}
              loading={loading}
              error={error}
              onRetry={refresh}
              className="h-full w-full"
            />
          </div>
          <div className="xl:col-span-1 h-full">
            <RecentTransactions entries={recentEntries} loading={loading} />
          </div>
        </section>

      </div>
    );
  };

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="ダッシュボード"
    >
      <div className="flex flex-col gap-6">{renderContent()}</div>
    </DashboardShell>
  );
};

type RecentTransactionsProps = {
  entries: FinancialEntry[];
  loading?: boolean;
};

const RecentTransactions = ({ entries, loading = false }: RecentTransactionsProps) => (
  <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-xl shadow-slate-900/10 ring-1 ring-white/60">
    <div
      className="pointer-events-none absolute -right-12 -top-10 h-36 w-36 rounded-full bg-white/40 blur-3xl"
      aria-hidden
    />
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">
        最近の収支一覧
      </h2>
      <span className="text-xs font-medium text-indigo-600">
        過去6件を表示
      </span>
    </div>
    {loading ? (
      <div className="mt-4 animate-pulse rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-400">
        取引を読み込んでいます…
      </div>
    ) : entries.length === 0 ? (
      <div className="mt-4 rounded-2xl bg-slate-50 py-10 text-center text-sm text-slate-400">
        まだ取引が登録されていません。
      </div>
    ) : (
      <ul className="mt-4 space-y-3">
        {entries.map((entry) => (
          <li
            key={`${entry.id}-${entry.type}-${entry.date}`}
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
    )}
  </div>
);

export default DashboardPage;
