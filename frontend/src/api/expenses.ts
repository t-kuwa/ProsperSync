import { apiClient } from "./client";
import {
  mapCategoryFromApi,
  type ApiCategory,
} from "./categories";
import type {
  Expense,
  ExpenseQueryParams,
  TransactionPayload,
  UserSummary,
} from "../features/transactions/types";

type ApiUser = {
  id: number;
  name: string;
  email: string;
};

type ApiExpense = {
  id: number;
  account_id: number;
  user_id: number;
  category_id: number;
  title: string;
  amount: number;
  spent_on: string;
  memo: string | null;
  created_at: string;
  updated_at: string;
  category?: ApiCategory;
  user?: ApiUser;
};

const mapUser = (user?: ApiUser): UserSummary | undefined =>
  user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    : undefined;

const mapExpense = (expense: ApiExpense): Expense => ({
  id: expense.id,
  accountId: expense.account_id,
  userId: expense.user_id,
  categoryId: expense.category_id,
  title: expense.title,
  amount: expense.amount,
  spentOn: expense.spent_on,
  memo: expense.memo,
  createdAt: expense.created_at,
  updatedAt: expense.updated_at,
  category: expense.category ? mapCategoryFromApi(expense.category) : undefined,
  user: mapUser(expense.user),
});

const buildQueryParams = (params?: ExpenseQueryParams) => {
  if (!params) {
    return undefined;
  }

  const query: Record<string, string | number> = {};

  if (params.startDate) {
    query.start_date = params.startDate;
  }
  if (params.endDate) {
    query.end_date = params.endDate;
  }
  if (params.month) {
    query.month = params.month;
  }
  if (typeof params.categoryId === "number") {
    query.category_id = params.categoryId;
  }

  return query;
};

export const getExpenses = async (
  accountId: number,
  params?: ExpenseQueryParams,
): Promise<Expense[]> => {
  const query = buildQueryParams(params);
  const { data } = await apiClient.get<ApiExpense[]>(
    `/api/v1/accounts/${accountId}/expenses`,
    { params: query },
  );

  // データが配列でない場合（エラーレスポンスなど）の処理
  if (!Array.isArray(data)) {
    console.error("getExpenses: Expected array but got:", data);
    return [];
  }

  return data.map(mapExpense);
};

export const getExpense = async (
  accountId: number,
  expenseId: number,
): Promise<Expense> => {
  const { data } = await apiClient.get<ApiExpense>(
    `/api/v1/accounts/${accountId}/expenses/${expenseId}`,
  );

  return mapExpense(data);
};

export const createExpense = async (
  accountId: number,
  payload: TransactionPayload,
): Promise<Expense> => {
  const { data } = await apiClient.post<ApiExpense>(
    `/api/v1/accounts/${accountId}/expenses`,
    {
      expense: {
        title: payload.title,
        amount: payload.amount,
        spent_on: payload.date,
        memo: payload.memo,
        category_id: payload.categoryId,
      },
    },
  );

  return mapExpense(data);
};

export const updateExpense = async (
  accountId: number,
  expenseId: number,
  payload: TransactionPayload,
): Promise<Expense> => {
  const { data } = await apiClient.patch<ApiExpense>(
    `/api/v1/accounts/${accountId}/expenses/${expenseId}`,
    {
      expense: {
        title: payload.title,
        amount: payload.amount,
        spent_on: payload.date,
        memo: payload.memo,
        category_id: payload.categoryId,
      },
    },
  );

  return mapExpense(data);
};

export const deleteExpense = async (
  accountId: number,
  expenseId: number,
): Promise<void> => {
  await apiClient.delete(`/api/v1/accounts/${accountId}/expenses/${expenseId}`);
};
