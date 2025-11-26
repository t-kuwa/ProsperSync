import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createFixedRecurringEntry,
  deleteFixedRecurringEntry,
  getFixedRecurringEntries,
  getFixedRecurringOccurrences,
  updateFixedRecurringEntry,
} from "../../../api/fixedRecurring";
import { getErrorMessage } from "../../../api/client";
import useAccountState from "../../accounts/hooks/useAccountState";
import type {
  FixedRecurringEntry,
  FixedRecurringEntryOccurrence,
  FixedRecurringEntryPayload,
  FixedRecurringStats,
} from "../types";

const formatMonthValue = (date: Date) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
};

const buildStats = (
  occurrences: FixedRecurringEntryOccurrence[],
): FixedRecurringStats => {
  return occurrences.reduce<FixedRecurringStats>(
    (acc, occurrence) => {
      const entry = occurrence.fixedRecurringEntry;
      if (occurrence.status === "canceled") {
        acc.canceledCount += 1;
      } else if (occurrence.status === "applied") {
        acc.appliedCount += 1;
      } else {
        acc.scheduledCount += 1;
      }

      if (!entry || occurrence.status === "canceled") {
        return acc;
      }

      if (entry.kind === "income") {
        acc.incomeTotal += entry.amount;
      } else {
        acc.expenseTotal += entry.amount;
      }
      return acc;
    },
    { incomeTotal: 0, expenseTotal: 0, scheduledCount: 0, appliedCount: 0, canceledCount: 0 },
  );
};

const useFixedRecurring = () => {
  const { currentAccountId } = useAccountState();
  const [entries, setEntries] = useState<FixedRecurringEntry[]>([]);
  const [occurrences, setOccurrences] = useState<FixedRecurringEntryOccurrence[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => formatMonthValue(new Date()));
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!currentAccountId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await getFixedRecurringEntries(currentAccountId);
      setEntries(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [currentAccountId]);

  const fetchOccurrences = useCallback(
    async (monthValue?: string) => {
      if (!currentAccountId) {
        setOccurrences([]);
        return;
      }

      const month = monthValue ?? selectedMonth;
      setLoading(true);
      setError(null);

      try {
        const data = await getFixedRecurringOccurrences(currentAccountId, month);
        setOccurrences(data);
      } catch (err) {
        setError(getErrorMessage(err));
        setOccurrences([]);
      } finally {
        setLoading(false);
      }
    },
    [currentAccountId, selectedMonth],
  );

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    void fetchOccurrences(selectedMonth);
  }, [fetchOccurrences, selectedMonth]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchEntries(), fetchOccurrences()]);
  }, [fetchEntries, fetchOccurrences]);

  const createEntry = useCallback(
    async (payload: FixedRecurringEntryPayload) => {
      if (!currentAccountId) return;
      setProcessing(true);
      setError(null);
      try {
        await createFixedRecurringEntry(currentAccountId, payload);
        await refreshAll();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, refreshAll],
  );

  const updateEntry = useCallback(
    async (entryId: number, payload: FixedRecurringEntryPayload) => {
      if (!currentAccountId) return;
      setProcessing(true);
      setError(null);
      try {
        await updateFixedRecurringEntry(currentAccountId, entryId, payload);
        await refreshAll();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, refreshAll],
  );

  const deleteEntry = useCallback(
    async (entryId: number) => {
      if (!currentAccountId) return;
      setProcessing(true);
      setError(null);
      try {
        await deleteFixedRecurringEntry(currentAccountId, entryId);
        await refreshAll();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, refreshAll],
  );

  const stats = useMemo(() => buildStats(occurrences), [occurrences]);

  return {
    entries,
    occurrences,
    selectedMonth,
    setSelectedMonth,
    loading,
    processing,
    error,
    stats,
    refreshAll,
    createEntry,
    updateEntry,
    deleteEntry,
  };
};

export default useFixedRecurring;
