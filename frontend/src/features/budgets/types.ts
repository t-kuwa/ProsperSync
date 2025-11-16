import type { Category } from "../transactions/types";

export type BudgetPeriodType = "monthly" | "yearly";

export type Budget = {
  id: number;
  accountId: number;
  categoryId: number | null;
  amount: number;
  periodType: BudgetPeriodType;
  periodMonth: number | null;
  periodYear: number;
  name: string | null;
  repeatEnabled: boolean;
  repeatUntilDate: string | null;
  parentBudgetId: number | null;
  periodLabel: string;
  currentSpent: number;
  remaining: number;
  percentage: number | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
};

export type BudgetPayload = {
  category_id: number | null;
  amount: number;
  period_type: BudgetPeriodType;
  period_year: number;
  period_month?: number | null;
  name?: string | null;
  repeat_enabled?: boolean;
  repeat_until_date?: string | null;
};

export type BudgetFilters = {
  periodType: BudgetPeriodType;
  year: number;
  month: number | null;
};

export type BudgetTotals = {
  totalBudget: number;
  totalSpent: number;
  overruns: number;
};

export type BudgetSummary = BudgetTotals & {
  topBudgets: Budget[];
};
