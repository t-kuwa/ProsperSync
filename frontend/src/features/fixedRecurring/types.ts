import type { Category, CategoryType } from "../transactions/types";

export type FixedRecurringEntryKind = CategoryType;

export type FixedRecurringEntry = {
  id: number;
  accountId: number;
  categoryId: number;
  title: string;
  kind: FixedRecurringEntryKind;
  amount: number;
  dayOfMonth: number;
  useEndOfMonth: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
};

export type FixedRecurringEntryPayload = {
  title: string;
  kind: FixedRecurringEntryKind;
  amount: number;
  dayOfMonth: number;
  useEndOfMonth: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  categoryId: number;
  memo?: string;
};

export type FixedRecurringEntryFormValues = {
  title: string;
  kind: FixedRecurringEntryKind;
  amount: number | string;
  dayOfMonth: number | string;
  useEndOfMonth: boolean;
  effectiveFromMonth: string;
  effectiveToMonth: string;
  categoryId: number | "";
  memo: string;
};

export type FixedRecurringEntryOccurrenceStatus = "scheduled" | "applied" | "canceled";

export type FixedRecurringEntryOccurrence = {
  id: number;
  fixedRecurringEntryId: number;
  periodMonth: string;
  occursOn: string;
  status: FixedRecurringEntryOccurrenceStatus;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fixedRecurringEntry?: FixedRecurringEntry;
};

export type FixedRecurringStats = {
  incomeTotal: number;
  expenseTotal: number;
  scheduledCount: number;
  appliedCount: number;
  canceledCount: number;
};
