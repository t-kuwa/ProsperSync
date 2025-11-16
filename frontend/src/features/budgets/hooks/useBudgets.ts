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
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [filters, setFilters] = useState<BudgetFilters>(() => buildDefaultFilters());
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildDateParam = useCallback((filterValues: BudgetFilters) => {
    if (filterValues.periodType === "monthly" && filterValues.month) {
      return `${filterValues.year}-${String(filterValues.month).padStart(2, "0")}-01`;
    }
    return `${filterValues.year}-01-01`;
  }, []);

  const fetchBudgets = useCallback(async (filterValues: BudgetFilters) => {
    if (!currentAccountId) {
      setAllBudgets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateParam = buildDateParam(filterValues);
      const data = await getBudgets(currentAccountId, { date: dateParam });
      setAllBudgets(data);
    } catch (err) {
      setAllBudgets([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentAccountId, buildDateParam]);

  useEffect(() => {
    void fetchBudgets(filters);
  }, [fetchBudgets, filters]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler = () => {
      void fetchBudgets(filters);
    };

    window.addEventListener(TRANSACTIONS_UPDATED_EVENT, handler);
    window.addEventListener(BUDGETS_UPDATED_EVENT, handler);

    return () => {
      window.removeEventListener(TRANSACTIONS_UPDATED_EVENT, handler);
      window.removeEventListener(BUDGETS_UPDATED_EVENT, handler);
    };
  }, [fetchBudgets, filters]);

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
        setAllBudgets((prev) => [budget, ...prev]);
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
        setAllBudgets((prev) =>
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
        setAllBudgets((prev) => prev.filter((item) => item.id !== budget.id));
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

  const filteredBudgets = useMemo(
    () => filterBudgetsByPeriod(allBudgets, filters),
    [allBudgets, filters],
  );

  const totals = useMemo<BudgetTotals>(() => {
    return filteredBudgets.reduce(
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
  }, [filteredBudgets]);

  return {
    budgets: filteredBudgets,
    filters,
    totals,
    loading,
    processing,
    error,
    updateFilters,
    create,
    update,
    remove,
    refresh: () => fetchBudgets(filters),
  };
};

export default useBudgets;

const filterBudgetsByPeriod = (budgets: Budget[], filterValues: BudgetFilters) => {
  if (filterValues.periodType === "monthly" && filterValues.month) {
    return budgets.filter(
      (budget) =>
        (budget.periodType === "monthly" &&
          budget.periodYear === filterValues.year &&
          budget.periodMonth === filterValues.month) ||
        (budget.periodType === "yearly" && budget.periodYear === filterValues.year),
    );
  }

  return budgets.filter(
    (budget) =>
      budget.periodType === "yearly" && budget.periodYear === filterValues.year,
  );
};
