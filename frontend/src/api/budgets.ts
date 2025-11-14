import { apiClient } from "./client";
import { mapCategoryFromApi, type ApiCategory } from "./categories";
import type { Budget, BudgetPayload } from "../features/budgets/types";

export type ApiBudget = {
  id: number;
  account_id: number;
  category_id: number | null;
  amount: number;
  period_type: "monthly" | "yearly";
  period_month: number | null;
  period_year: number;
  name: string | null;
  period_label: string;
  current_spent: number | null;
  remaining: number | null;
  percentage: number | null;
  created_at: string;
  updated_at: string;
  category: ApiCategory | null;
};

const mapBudget = (budget: ApiBudget): Budget => ({
  id: budget.id,
  accountId: budget.account_id,
  categoryId: budget.category_id,
  amount: budget.amount,
  periodType: budget.period_type,
  periodMonth: budget.period_month,
  periodYear: budget.period_year,
  name: budget.name,
  periodLabel: budget.period_label,
  currentSpent: budget.current_spent ?? 0,
  remaining: budget.remaining ?? 0,
  percentage: budget.percentage ?? 0,
  category: budget.category ? mapCategoryFromApi(budget.category) : null,
  createdAt: budget.created_at,
  updatedAt: budget.updated_at,
});

export const getBudgets = async (
  accountId: number,
  params?: { date?: string },
): Promise<Budget[]> => {
  const { data } = await apiClient.get<ApiBudget[]>(
    `/api/v1/accounts/${accountId}/budgets`,
    { params },
  );
  return data.map(mapBudget);
};

export const getCurrentBudgets = async (
  accountId: number,
  params?: { date?: string },
): Promise<Budget[]> => {
  const { data } = await apiClient.get<ApiBudget[]>(
    `/api/v1/accounts/${accountId}/budgets/current`,
    { params },
  );
  return data.map(mapBudget);
};

export const createBudget = async (
  accountId: number,
  payload: BudgetPayload,
): Promise<Budget> => {
  const { data } = await apiClient.post<ApiBudget>(
    `/api/v1/accounts/${accountId}/budgets`,
    { budget: payload },
  );
  return mapBudget(data);
};

export const updateBudget = async (
  accountId: number,
  budgetId: number,
  payload: BudgetPayload,
): Promise<Budget> => {
  const { data } = await apiClient.patch<ApiBudget>(
    `/api/v1/accounts/${accountId}/budgets/${budgetId}`,
    { budget: payload },
  );
  return mapBudget(data);
};

export const deleteBudget = async (
  accountId: number,
  budgetId: number,
): Promise<void> => {
  await apiClient.delete(`/api/v1/accounts/${accountId}/budgets/${budgetId}`);
};
