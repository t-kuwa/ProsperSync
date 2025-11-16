export type DashboardTotals = {
  income: number;
  expense: number;
};

export type DashboardBalance = {
  totalIncome: number;
  totalExpense: number;
  net: number;
};

export type CategorySummary = {
  id: number;
  name: string;
  color: string | null;
};

export type RecentTransaction = {
  id: number;
  resourceType: "income" | "expense";
  title: string;
  amount: number;
  date: string;
  memo: string | null;
  category: CategorySummary | null;
};

export type MonthlyStat = {
  month: string;
  label: string;
  income: number;
  expense: number;
};

export type CalendarEntry = {
  date: string;
  income: number;
  expense: number;
};

export type BudgetSnapshot = {
  id: number;
  name: string | null;
  amount: number;
  periodLabel: string;
  currentSpent: number;
  remaining: number;
  percentage: number;
  category: CategorySummary | null;
};

export type DashboardBudgetSummary = {
  totalBudget: number;
  totalSpent: number;
  overruns: number;
  topBudgets: BudgetSnapshot[];
};

export type DashboardStats = {
  account: {
    id: number;
    name: string;
  };
  currentMonth: DashboardTotals;
  previousMonth: DashboardTotals;
  monthlyBreakdown: MonthlyStat[];
  recentTransactions: RecentTransaction[];
  calendarEntries: CalendarEntry[];
  balance: DashboardBalance;
  budgetSummary: DashboardBudgetSummary;
};

export type FinancialEntry = {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note?: string;
  color?: string | null;
};
