import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../api/categories";
import { getErrorMessage } from "../../../api/client";
import useAccountState from "../../accounts/hooks/useAccountState";
import type {
  Category,
  CategoryPayload,
  CategoryType,
} from "../types";

const sortCategories = (categories: Category[]) =>
  [...categories].sort((a, b) => {
    if (a.position !== b.position) {
      return a.position - b.position;
    }

    return a.name.localeCompare(b.name, "ja");
  });

const useCategories = () => {
  const { currentAccountId } = useAccountState();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCategories = useCallback(async () => {
    if (!currentAccountId) {
      setCategories([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCategories(currentAccountId);
      setCategories(sortCategories(data));
    } catch (err) {
      setCategories([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentAccountId]);

  useEffect(() => {
    void refreshCategories();
  }, [refreshCategories]);

  const createCategoryForAccount = useCallback(
    async (payload: CategoryPayload) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        const category = await createCategory(currentAccountId, payload);
        setCategories((prev) => sortCategories([...prev, category]));
        return category;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId],
  );

  const updateCategoryForAccount = useCallback(
    async (categoryId: number, payload: CategoryPayload) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        const category = await updateCategory(
          currentAccountId,
          categoryId,
          payload,
        );
        setCategories((prev) =>
          sortCategories(
            prev.map((item) => (item.id === category.id ? category : item)),
          ),
        );
        return category;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId],
  );

  const deleteCategoryForAccount = useCallback(
    async (categoryId: number) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        await deleteCategory(currentAccountId, categoryId);
        setCategories((prev) => prev.filter((item) => item.id !== categoryId));
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId],
  );

  const categoriesByType = useMemo(() => {
    return categories.reduce<Record<CategoryType, Category[]>>(
      (acc, category) => {
        acc[category.type].push(category);
        return acc;
      },
      { income: [], expense: [] },
    );
  }, [categories]);

  return {
    categories,
    expenseCategories: categoriesByType.expense,
    incomeCategories: categoriesByType.income,
    loading,
    processing,
    error,
    refreshCategories,
    createCategory: createCategoryForAccount,
    updateCategory: updateCategoryForAccount,
    deleteCategory: deleteCategoryForAccount,
  };
};

export default useCategories;
