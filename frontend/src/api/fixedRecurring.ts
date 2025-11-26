import { apiClient } from "./client";
import { mapCategoryFromApi, type ApiCategory } from "./categories";
import type {
  FixedRecurringEntry,
  FixedRecurringEntryOccurrence,
  FixedRecurringEntryPayload,
} from "../features/fixedRecurring/types";

type ApiFixedRecurringEntry = {
  id: number;
  account_id: number;
  category_id: number;
  title: string;
  kind: "expense" | "income";
  amount: number;
  day_of_month: number;
  use_end_of_month: boolean;
  effective_from: string;
  effective_to: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
  category?: ApiCategory;
};

type ApiFixedRecurringEntryOccurrence = {
  id: number;
  fixed_recurring_entry_id: number;
  period_month: string;
  occurs_on: string;
  status: "scheduled" | "applied" | "canceled";
  applied_at: string | null;
  created_at: string;
  updated_at: string;
  fixed_recurring_entry?: ApiFixedRecurringEntry;
};

const mapEntry = (entry: ApiFixedRecurringEntry): FixedRecurringEntry => ({
  id: entry.id,
  accountId: entry.account_id,
  categoryId: entry.category_id,
  title: entry.title,
  kind: entry.kind,
  amount: entry.amount,
  dayOfMonth: entry.day_of_month,
  useEndOfMonth: entry.use_end_of_month,
  effectiveFrom: entry.effective_from,
  effectiveTo: entry.effective_to,
  memo: entry.memo,
  createdAt: entry.created_at,
  updatedAt: entry.updated_at,
  category: entry.category ? mapCategoryFromApi(entry.category) : undefined,
});

const mapOccurrence = (
  occurrence: ApiFixedRecurringEntryOccurrence,
): FixedRecurringEntryOccurrence => ({
  id: occurrence.id,
  fixedRecurringEntryId: occurrence.fixed_recurring_entry_id,
  periodMonth: occurrence.period_month,
  occursOn: occurrence.occurs_on,
  status: occurrence.status,
  appliedAt: occurrence.applied_at,
  createdAt: occurrence.created_at,
  updatedAt: occurrence.updated_at,
  fixedRecurringEntry: occurrence.fixed_recurring_entry
    ? mapEntry(occurrence.fixed_recurring_entry)
    : undefined,
});

export const getFixedRecurringEntries = async (
  accountId: number,
): Promise<FixedRecurringEntry[]> => {
  const { data } = await apiClient.get<ApiFixedRecurringEntry[]>(
    `/api/v1/accounts/${accountId}/fixed_recurring_entries`,
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(mapEntry);
};

export const createFixedRecurringEntry = async (
  accountId: number,
  payload: FixedRecurringEntryPayload,
): Promise<FixedRecurringEntry> => {
  const { data } = await apiClient.post<ApiFixedRecurringEntry>(
    `/api/v1/accounts/${accountId}/fixed_recurring_entries`,
    {
      fixed_recurring_entry: {
        title: payload.title,
        kind: payload.kind,
        amount: payload.amount,
        day_of_month: payload.dayOfMonth,
        use_end_of_month: payload.useEndOfMonth,
        effective_from: payload.effectiveFrom,
        effective_to: payload.effectiveTo,
        category_id: payload.categoryId,
        memo: payload.memo,
      },
    },
  );

  return mapEntry(data);
};

export const updateFixedRecurringEntry = async (
  accountId: number,
  entryId: number,
  payload: FixedRecurringEntryPayload,
): Promise<FixedRecurringEntry> => {
  const { data } = await apiClient.patch<ApiFixedRecurringEntry>(
    `/api/v1/accounts/${accountId}/fixed_recurring_entries/${entryId}`,
    {
      fixed_recurring_entry: {
        title: payload.title,
        kind: payload.kind,
        amount: payload.amount,
        day_of_month: payload.dayOfMonth,
        use_end_of_month: payload.useEndOfMonth,
        effective_from: payload.effectiveFrom,
        effective_to: payload.effectiveTo,
        category_id: payload.categoryId,
        memo: payload.memo,
      },
    },
  );

  return mapEntry(data);
};

export const deleteFixedRecurringEntry = async (
  accountId: number,
  entryId: number,
): Promise<void> => {
  await apiClient.delete(`/api/v1/accounts/${accountId}/fixed_recurring_entries/${entryId}`);
};

export const getFixedRecurringOccurrences = async (
  accountId: number,
  month: string,
): Promise<FixedRecurringEntryOccurrence[]> => {
  const { data } = await apiClient.get<ApiFixedRecurringEntryOccurrence[]>(
    `/api/v1/accounts/${accountId}/fixed_recurring_occurrences`,
    { params: { month } },
  );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(mapOccurrence);
};
