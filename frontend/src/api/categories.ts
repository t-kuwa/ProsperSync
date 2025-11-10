import { apiClient } from "./client";
import type {
  Category,
  CategoryPayload,
  CategoryType,
} from "../features/transactions/types";

export type ApiCategory = {
  id: number;
  account_id: number;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export const mapCategoryFromApi = (category: ApiCategory): Category => ({
  id: category.id,
  accountId: category.account_id,
  name: category.name,
  type: category.type,
  color: category.color,
  icon: category.icon,
  position: category.position,
  createdAt: category.created_at,
  updatedAt: category.updated_at,
});

export const getCategories = async (
  accountId: number,
  type?: CategoryType,
): Promise<Category[]> => {
  const params = type ? { type } : undefined;
  const { data } = await apiClient.get<ApiCategory[]>(
    `/api/v1/accounts/${accountId}/categories`,
    { params },
  );

  // データが配列でない場合（エラーレスポンスなど）の処理
  if (!Array.isArray(data)) {
    console.error("getCategories: Expected array but got:", data);
    return [];
  }

  return data.map(mapCategoryFromApi);
};

export const createCategory = async (
  accountId: number,
  payload: CategoryPayload,
): Promise<Category> => {
  const { data } = await apiClient.post<ApiCategory>(
    `/api/v1/accounts/${accountId}/categories`,
    {
      category: {
        name: payload.name,
        type: payload.type,
        color: payload.color,
        icon: payload.icon,
        position: payload.position,
      },
    },
  );

  return mapCategoryFromApi(data);
};

export const updateCategory = async (
  accountId: number,
  categoryId: number,
  payload: CategoryPayload,
): Promise<Category> => {
  const { data } = await apiClient.patch<ApiCategory>(
    `/api/v1/accounts/${accountId}/categories/${categoryId}`,
    {
      category: {
        name: payload.name,
        type: payload.type,
        color: payload.color,
        icon: payload.icon,
        position: payload.position,
      },
    },
  );

  return mapCategoryFromApi(data);
};

export const deleteCategory = async (
  accountId: number,
  categoryId: number,
): Promise<void> => {
  await apiClient.delete(`/api/v1/accounts/${accountId}/categories/${categoryId}`);
};
