import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../../../api/expenses";
import {
  createIncome,
  deleteIncome,
  getIncomes,
  updateIncome,
} from "../../../api/incomes";
import { getErrorMessage } from "../../../api/client";
import useAccountState from "../../accounts/hooks/useAccountState";
import type { FinancialEntry } from "../../dashboard/types";
import type {
  Expense,
  Income,
  PaginationState,
  Transaction,
  TransactionFilters,
  TransactionPayload,
  TransactionSort,
  TransactionSortDirection,
  TransactionSortField,
  TransactionType,
} from "../types";

const DEFAULT_FILTERS: TransactionFilters = {
  type: "all",
  categoryId: null,
  startDate: null,
  endDate: null,
  month: null,
  search: "",
};

const DEFAULT_SORT: TransactionSort = {
  field: "date",
  direction: "desc",
};

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 8,
};

const toTransaction = (record: Expense | Income, resourceType: TransactionType): Transaction => {
  const category = record.category;

  if (!category) {
    throw new Error("カテゴリ情報の取得に失敗しました。");
  }

  return {
    uid: `${resourceType}-${record.id}`,
    resourceId: record.id,
    resourceType,
    title: record.title,
    amount: record.amount,
    date: resourceType === "expense" ? (record as Expense).spentOn : (record as Income).receivedOn,
    memo: record.memo,
    category,
    user: record.user,
  };
};

const buildQueryFromFilters = (filters: TransactionFilters) => {
  const query: {
    startDate?: string;
    endDate?: string;
    month?: string;
    categoryId?: number;
  } = {};

  if (filters.startDate) {
    query.startDate = filters.startDate;
  }
  if (filters.endDate) {
    query.endDate = filters.endDate;
  }
  if (filters.month) {
    query.month = filters.month;
  }
  if (typeof filters.categoryId === "number") {
    query.categoryId = filters.categoryId;
  }

  return query;
};

const sortTransactions = (
  transactions: Transaction[],
  sort: TransactionSort,
): Transaction[] => {
  const list = [...transactions];

  list.sort((a, b) => {
    let result = 0;
    if (sort.field === "date") {
      result = a.date.localeCompare(b.date);
    } else if (sort.field === "amount") {
      result = a.amount - b.amount;
    } else {
      result = a.category.name.localeCompare(b.category.name, "ja");
    }

    return sort.direction === "asc" ? result : -result;
  });

  return list;
};

const useTransactions = () => {
  const { currentAccountId } = useAccountState();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<TransactionSort>(DEFAULT_SORT);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { type, categoryId, startDate, endDate, month } = filters;

  const fetchTransactions = useCallback(async () => {
    if (!currentAccountId) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = buildQueryFromFilters({
        type,
        categoryId,
        startDate,
        endDate,
        month,
        search: "",
      });

      const [expenses, incomes] = await Promise.all([
        type === "income"
          ? Promise.resolve<Expense[]>([])
          : getExpenses(currentAccountId, query),
        type === "expense"
          ? Promise.resolve<Income[]>([])
          : getIncomes(currentAccountId, query),
      ]);

      const nextTransactions = [
        ...expenses.map((expense) => toTransaction(expense, "expense")),
        ...incomes.map((income) => toTransaction(income, "income")),
      ];

      setTransactions(nextTransactions);
      setPagination((prev) => ({ ...prev, page: 1 }));
    } catch (err) {
      setTransactions([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentAccountId, type, categoryId, startDate, endDate, month]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const refreshTransactions = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  const updateFilter = useCallback(
    <Key extends keyof TransactionFilters>(key: Key, value: TransactionFilters[Key]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));

      if (key !== "search") {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination(DEFAULT_PAGINATION);
  }, []);

  const toggleSort = useCallback(
    (field: TransactionSortField) => {
      setSort((prev) => {
        if (prev.field === field) {
          const nextDirection: TransactionSortDirection =
            prev.direction === "asc" ? "desc" : "asc";
          return { ...prev, direction: nextDirection };
        }

        return {
          field,
          direction: field === "category" ? "asc" : "desc",
        };
      });
    },
    [],
  );

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize });
  }, []);

  const filteredTransactions = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    if (!keyword) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      return (
        transaction.title.toLowerCase().includes(keyword) ||
        transaction.category.name.toLowerCase().includes(keyword) ||
        (transaction.memo ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [transactions, filters.search]);

  const sortedTransactions = useMemo(
    () => sortTransactions(filteredTransactions, sort),
    [filteredTransactions, sort],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedTransactions.length / pagination.pageSize),
  );

  useEffect(() => {
    if (pagination.page > totalPages) {
      setPagination((prev) => ({ ...prev, page: totalPages }));
    }
  }, [pagination.page, totalPages]);

  const paginatedTransactions = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return sortedTransactions.slice(start, start + pagination.pageSize);
  }, [sortedTransactions, pagination.page, pagination.pageSize]);

  const calendarEntries = useMemo<FinancialEntry[]>(
    () =>
      transactions.map((transaction) => ({
        id: transaction.resourceId,
        type: transaction.resourceType,
        category: transaction.category.name,
        amount: transaction.amount,
        date: transaction.date,
        note: transaction.memo ?? undefined,
      })),
    [transactions],
  );

  const createTransactionEntry = useCallback(
    async (payload: TransactionPayload) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        if (payload.type === "expense") {
          await createExpense(currentAccountId, payload);
        } else {
          await createIncome(currentAccountId, payload);
        }

        await fetchTransactions();
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, fetchTransactions],
  );

  const updateTransactionEntry = useCallback(
    async (transaction: Transaction, payload: TransactionPayload) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        if (transaction.resourceType === "expense") {
          await updateExpense(currentAccountId, transaction.resourceId, payload);
        } else {
          await updateIncome(currentAccountId, transaction.resourceId, payload);
        }

        await fetchTransactions();
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, fetchTransactions],
  );

  const deleteTransactionEntry = useCallback(
    async (transaction: Transaction) => {
      if (!currentAccountId) {
        throw new Error("アカウントが選択されていません。");
      }

      setProcessing(true);
      setError(null);

      try {
        if (transaction.resourceType === "expense") {
          await deleteExpense(currentAccountId, transaction.resourceId);
        } else {
          await deleteIncome(currentAccountId, transaction.resourceId);
        }

        await fetchTransactions();
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, fetchTransactions],
  );

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.resourceType === "income") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  return {
    transactions: paginatedTransactions,
    allTransactions: transactions,
    totals,
    filters,
    sort,
    pagination,
    totalPages,
    loading,
    processing,
    error,
    calendarEntries,
    refreshTransactions,
    updateFilter,
    resetFilters,
    toggleSort,
    setPage,
    setPageSize,
    createTransaction: createTransactionEntry,
    updateTransaction: updateTransactionEntry,
    deleteTransaction: deleteTransactionEntry,
  };
};

export default useTransactions;
