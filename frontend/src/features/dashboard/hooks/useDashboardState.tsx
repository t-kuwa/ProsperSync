import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getDashboardStats } from "../../../api/dashboard";
import { getErrorMessage } from "../../../api/client";
import useAccountState from "../../accounts/hooks/useAccountState";
import {
  type CalendarEntry,
  type DashboardBalance,
  type DashboardStats,
  type DashboardTotals,
  type FinancialEntry,
  type MonthlyStat,
} from "../types";
import {
  BUDGETS_UPDATED_EVENT,
  TRANSACTIONS_UPDATED_EVENT,
} from "../../../constants/events";

const emptyTotals: DashboardTotals = { income: 0, expense: 0 };
const emptyBalance: DashboardBalance = { totalIncome: 0, totalExpense: 0, net: 0 };
const emptyBudgetSummary = {
  totalBudget: 0,
  totalSpent: 0,
  overruns: 0,
  topBudgets: [],
} as const;

const useDashboardStateInternal = () => {
  const { currentAccountId } = useAccountState();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!currentAccountId) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardStats(currentAccountId);
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [currentAccountId]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler = () => {
      void fetchStats();
    };
    window.addEventListener(TRANSACTIONS_UPDATED_EVENT, handler);
    window.addEventListener(BUDGETS_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(TRANSACTIONS_UPDATED_EVENT, handler);
      window.removeEventListener(BUDGETS_UPDATED_EVENT, handler);
    };
  }, [fetchStats]);

  const currentTotals = stats?.currentMonth ?? emptyTotals;
  const previousTotals = stats?.previousMonth ?? emptyTotals;

  const netCashflow = currentTotals.income - currentTotals.expense;

  const averageMonthlyNet =
    stats && stats.monthlyBreakdown.length > 0
      ? stats.monthlyBreakdown.reduce(
          (acc, month) => acc + (month.income - month.expense),
          0,
        ) / stats.monthlyBreakdown.length
      : 0;

  const runRate = Math.max(0, Math.round(averageMonthlyNet * 12));

  const growthRatio =
    previousTotals.income === 0
      ? 0
      : ((currentTotals.income - previousTotals.income) / previousTotals.income) * 100;

  const inflowOutflowRatio =
    currentTotals.income === 0
      ? 0
      : Math.min(
          100,
          Math.max(0, Math.round((currentTotals.expense / currentTotals.income) * 100)),
        );

  const recentEntries = useMemo<FinancialEntry[]>(() => {
    if (!stats) {
      return [];
    }

    return stats.recentTransactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.resourceType,
      category: transaction.category?.name ?? "未分類",
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.memo ?? undefined,
      color: transaction.category?.color ?? undefined,
    }));
  }, [stats]);

  const calendarEntries: CalendarEntry[] = stats?.calendarEntries ?? [];
  const monthlyBreakdown: MonthlyStat[] = stats?.monthlyBreakdown ?? [];
  const balance = stats?.balance ?? emptyBalance;
  const budgetSummary = stats?.budgetSummary ?? emptyBudgetSummary;

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
    currentTotals,
    previousTotals,
    netCashflow,
    runRate,
    growthRatio,
    inflowOutflowRatio,
    recentEntries,
    calendarEntries,
    monthlyBreakdown,
    balance,
    budgetSummary,
  };
};

type DashboardState = ReturnType<typeof useDashboardStateInternal>;

const DashboardStateContext = createContext<DashboardState | null>(null);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const value = useDashboardStateInternal();

  return (
    <DashboardStateContext.Provider value={value}>
      {children}
    </DashboardStateContext.Provider>
  );
};

const useDashboardState = () => {
  const context = useContext(DashboardStateContext);

  if (!context) {
    throw new Error("useDashboardState must be used within DashboardProvider");
  }

  return context;
};

export default useDashboardState;
