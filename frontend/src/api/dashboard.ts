import { apiClient } from "./client";
import { mapCategoryFromApi, type ApiCategory } from "./categories";
import type {
  DashboardStats,
  MonthlyStat,
  CalendarEntry,
  RecentTransaction,
  DashboardTotals,
  DashboardBalance,
} from "../features/dashboard/types";

type ApiDashboardAccount = {
  id: number;
  name: string;
};

type ApiDashboardCurrentMonth = {
  income: number;
  expense: number;
};

type ApiDashboardPreviousMonth = {
  income: number;
  expense: number;
};

type ApiDashboardMonthlyBreakdown = {
  month: string;
  label: string;
  income: number;
  expense: number;
};

type ApiDashboardCalendarEntry = {
  date: string;
  income: number;
  expense: number;
};

type ApiDashboardRecentTransaction = {
  id: number;
  resource_type: "income" | "expense";
  title: string;
  amount: number;
  date: string;
  memo: string | null;
  category: ApiCategory;
};

type ApiDashboardBalance = {
  total_income: number;
  total_expense: number;
  net: number;
};

type ApiDashboardStats = {
  account: ApiDashboardAccount;
  current_month: ApiDashboardCurrentMonth;
  previous_month: ApiDashboardPreviousMonth;
  monthly_breakdown: ApiDashboardMonthlyBreakdown[];
  recent_transactions: ApiDashboardRecentTransaction[];
  calendar_entries: ApiDashboardCalendarEntry[];
  balance: ApiDashboardBalance;
};

const mapMonthlyStat = (item: ApiDashboardMonthlyBreakdown): MonthlyStat => ({
  month: item.month,
  label: item.label,
  income: item.income,
  expense: item.expense,
});

const mapCalendarEntry = (
  entry: ApiDashboardCalendarEntry,
): CalendarEntry => ({
  date: entry.date,
  income: entry.income,
  expense: entry.expense,
});

const mapRecentTransaction = (
  transaction: ApiDashboardRecentTransaction,
): RecentTransaction => {
  const category = mapCategoryFromApi(transaction.category);
  return {
    id: transaction.id,
    resourceType: transaction.resource_type,
    title: transaction.title,
    amount: transaction.amount,
    date: transaction.date,
    memo: transaction.memo,
    category: category
      ? {
          id: category.id,
          name: category.name,
          color: category.color,
        }
      : null,
  };
};

const mapDashboardTotals = (
  data: ApiDashboardCurrentMonth | ApiDashboardPreviousMonth,
): DashboardTotals => ({
  income: data.income,
  expense: data.expense,
});

const mapDashboardBalance = (data: ApiDashboardBalance): DashboardBalance => ({
  totalIncome: data.total_income,
  totalExpense: data.total_expense,
  net: data.net,
});

const mapDashboardStats = (data: ApiDashboardStats): DashboardStats => ({
  account: {
    id: data.account.id,
    name: data.account.name,
  },
  currentMonth: mapDashboardTotals(data.current_month),
  previousMonth: mapDashboardTotals(data.previous_month),
  monthlyBreakdown: data.monthly_breakdown.map(mapMonthlyStat),
  recentTransactions: data.recent_transactions.map(mapRecentTransaction),
  calendarEntries: data.calendar_entries.map(mapCalendarEntry),
  balance: mapDashboardBalance(data.balance),
});

export const getDashboardStats = async (
  accountId: number,
): Promise<DashboardStats> => {
  const { data } = await apiClient.get<ApiDashboardStats>(
    `/api/v1/accounts/${accountId}/dashboard/stats`,
  );

  return mapDashboardStats(data);
};
