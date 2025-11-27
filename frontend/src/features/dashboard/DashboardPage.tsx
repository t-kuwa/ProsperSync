import { useMemo } from "react";
import CalendarOverview from "./components/CalendarOverview";
import FinancialOverview from "./components/FinancialOverview";
import InsightsPanel from "./components/InsightsPanel";
import SummaryCards from "./components/SummaryCards";
import BudgetHighlights from "./components/BudgetHighlights";
import useDashboardState from "./hooks/useDashboardState";
import formatCurrency from "./utils/formatCurrency";

const DashboardPage = () => {
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
            : "順調",
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
        <div className="animate-fade-in-fast">
          <SummaryCards cards={visibleSummaryCards} />
        </div>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-stretch">
          <div className="xl:col-span-2 h-full animate-fade-in-fast">
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
            <div className="animate-fade-in-fast">
              <InsightsPanel
                inflowOutflowRatio={inflowOutflowRatio}
                totalAccountBalance={totalAccountBalance}
                className="h-full"
              />
            </div>
            <div className="animate-fade-in-fast">
              <BudgetHighlights summary={budgetSummary} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-stretch">
          <div className="xl:col-span-3 h-full animate-fade-in-fast">
            <FinancialOverview
              monthlyBreakdown={monthlyBreakdown}
              loading={loading}
              error={error}
              onRetry={refresh}
              className="h-full w-full"
            />
          </div>
        </section>

      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-1">Overview of your financial health</p>
          </div>
          {/* Add date picker or other controls here if needed */}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardPage;
