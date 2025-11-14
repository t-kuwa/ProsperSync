import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../../../api/budgets";
import { getErrorMessage } from "../../../api/client";
import useAccountState from "../../accounts/hooks/useAccountState";
import {
  BUDGETS_UPDATED_EVENT,
  TRANSACTIONS_UPDATED_EVENT,
} from "../../../constants/events";
import type { Budget, BudgetFilters, BudgetPayload, BudgetTotals } from "../types";

const buildDefaultFilters = (): BudgetFilters => {
  const today = new Date();
  return {
    periodType: "monthly",
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };
};

const useBudgets = () => {
  const { currentAccountId } = useAccountState();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filters, setFilters] = useState<BudgetFilters>(() => buildDefaultFilters());
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildDateParam = useCallback(() => {
    if (filters.periodType === "monthly" && filters.month) {
      return `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
    }
    return `${filters.year}-01-01`;
  }, [filters]);

  const fetchBudgets = useCallback(async () => {
    if (!currentAccountId) {
      setBudgets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateParam = buildDateParam();
      const data = await getBudgets(currentAccountId, { date: dateParam });
      setBudgets(data);
    } catch (err) {
      setBudgets([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentAccountId, buildDateParam]);

  useEffect(() => {
    void fetchBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler = () => {
      void fetchBudgets();
    };

    window.addEventListener(TRANSACTIONS_UPDATED_EVENT, handler);
    window.addEventListener(BUDGETS_UPDATED_EVENT, handler);

    return () => {
      window.removeEventListener(TRANSACTIONS_UPDATED_EVENT, handler);
      window.removeEventListener(BUDGETS_UPDATED_EVENT, handler);
    };
  }, [fetchBudgets]);

  const updateFilters = useCallback((partial: Partial<BudgetFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...partial };
      if (partial.periodType === "yearly") {
        next.month = null;
      }
      return next;
    });
  }, []);

  const notifyUpdated = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(new CustomEvent(BUDGETS_UPDATED_EVENT));
  }, []);

  const create = useCallback(
    async (payload: BudgetPayload) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        const budget = await createBudget(currentAccountId, payload);
        setBudgets((prev) => [budget, ...prev]);
        notifyUpdated();
        return budget;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, notifyUpdated],
  );

  const update = useCallback(
    async (budget: Budget, payload: BudgetPayload) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        const updated = await updateBudget(currentAccountId, budget.id, payload);
        setBudgets((prev) =>
          prev.map((item) => (item.id === budget.id ? updated : item)),
        );
        notifyUpdated();
        return updated;
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, notifyUpdated],
  );

  const remove = useCallback(
    async (budget: Budget) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        await deleteBudget(currentAccountId, budget.id);
        setBudgets((prev) => prev.filter((item) => item.id !== budget.id));
        notifyUpdated();
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, notifyUpdated],
  );

  const totals = useMemo<BudgetTotals>(() => {
    return budgets.reduce(
      (acc, budget) => {
        acc.totalBudget += budget.amount;
        acc.totalSpent += budget.currentSpent ?? 0;
        if ((budget.currentSpent ?? 0) > budget.amount) {
          acc.overruns += 1;
        }
        return acc;
      },
      { totalBudget: 0, totalSpent: 0, overruns: 0 },
    );
  }, [budgets]);

  return {
    budgets,
    filters,
    totals,
    loading,
    processing,
    error,
    updateFilters,
    create,
    update,
    remove,
    refresh: fetchBudgets,
  };
};

export default useBudgets;
