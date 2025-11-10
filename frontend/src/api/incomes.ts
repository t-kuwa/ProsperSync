import { apiClient } from "./client";
import {
  mapCategoryFromApi,
  type ApiCategory,
} from "./categories";
import type {
  Income,
  IncomeQueryParams,
  TransactionPayload,
  UserSummary,
} from "../features/transactions/types";

type ApiUser = {
  id: number;
  name: string;
  email: string;
};

type ApiIncome = {
  id: number;
  account_id: number;
  user_id: number;
  category_id: number;
  title: string;
  amount: number;
  received_on: string;
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

const mapIncome = (income: ApiIncome): Income => ({
  id: income.id,
  accountId: income.account_id,
  userId: income.user_id,
  categoryId: income.category_id,
  title: income.title,
  amount: income.amount,
  receivedOn: income.received_on,
  memo: income.memo,
  createdAt: income.created_at,
  updatedAt: income.updated_at,
  category: income.category ? mapCategoryFromApi(income.category) : undefined,
  user: mapUser(income.user),
});

const buildQueryParams = (params?: IncomeQueryParams) => {
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

export const getIncomes = async (
  accountId: number,
  params?: IncomeQueryParams,
): Promise<Income[]> => {
  const query = buildQueryParams(params);
  const { data } = await apiClient.get<ApiIncome[]>(
    `/api/v1/accounts/${accountId}/incomes`,
    { params: query },
  );

  // データが配列でない場合（エラーレスポンスなど）の処理
  if (!Array.isArray(data)) {
    console.error("getIncomes: Expected array but got:", data);
    return [];
  }

  return data.map(mapIncome);
};

export const getIncome = async (
  accountId: number,
  incomeId: number,
): Promise<Income> => {
  const { data } = await apiClient.get<ApiIncome>(
    `/api/v1/accounts/${accountId}/incomes/${incomeId}`,
  );

  return mapIncome(data);
};

export const createIncome = async (
  accountId: number,
  payload: TransactionPayload,
): Promise<Income> => {
  const { data } = await apiClient.post<ApiIncome>(
    `/api/v1/accounts/${accountId}/incomes`,
    {
      income: {
        title: payload.title,
        amount: payload.amount,
        received_on: payload.date,
        memo: payload.memo,
        category_id: payload.categoryId,
      },
    },
  );

  return mapIncome(data);
};

export const updateIncome = async (
  accountId: number,
  incomeId: number,
  payload: TransactionPayload,
): Promise<Income> => {
  const { data } = await apiClient.patch<ApiIncome>(
    `/api/v1/accounts/${accountId}/incomes/${incomeId}`,
    {
      income: {
        title: payload.title,
        amount: payload.amount,
        received_on: payload.date,
        memo: payload.memo,
        category_id: payload.categoryId,
      },
    },
  );

  return mapIncome(data);
};

export const deleteIncome = async (
  accountId: number,
  incomeId: number,
): Promise<void> => {
  await apiClient.delete(`/api/v1/accounts/${accountId}/incomes/${incomeId}`);
};
