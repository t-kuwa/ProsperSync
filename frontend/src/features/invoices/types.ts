import type { AccountSummary } from "../accounts/types";

export type InvoiceStatus = "draft" | "issued" | "cancel_pending" | "canceled";

export type InvoiceLine = {
  id: number;
  description: string;
  quantity: number;
  unitPriceMinor: number;
  position?: number | null;
};

export type Invoice = {
  id: number;
  issuerAccountId: number;
  payerAccountId: number;
  title: string;
  description: string | null;
  amountMinor: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string | null;
  dueDate: string | null;
  invoiceNumber: string | null;
  issuerContact: Record<string, unknown> | null;
  payerContact: Record<string, unknown> | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  lines: InvoiceLine[];
  issuerAccount?: AccountSummary;
  payerAccount?: AccountSummary;
  cancelRequests?: InvoiceCancelRequest[];
};

export type InvoiceLineInput = {
  description: string;
  quantity: number;
  unitPriceMinor: number;
  position?: number;
};

export type InvoicePayload = {
  payerAccountId: number;
  title: string;
  description?: string;
  currency?: string;
  issueDate?: string | null;
  dueDate?: string | null;
  memo?: string;
  lines: InvoiceLineInput[];
};

export type InvoiceCancelRequest = {
  id: number;
  invoiceId: number;
  requestedById: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  resolvedById: number | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceFilterState = {
  status: InvoiceStatus | "all";
  role: "issuer" | "payer" | "all";
  search: string;
};
