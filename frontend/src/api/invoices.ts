import { apiClient } from "./client";
import type { Invoice, InvoiceCancelRequest, InvoicePayload, InvoiceStatus } from "../features/invoices/types";

type ApiInvoiceLine = {
  id: number;
  description: string;
  quantity: number;
  unit_price_minor: number;
  position: number | null;
};

type ApiInvoice = {
  id: number;
  issuer_account_id: number;
  payer_account_id: number;
  title: string;
  description: string | null;
  amount_minor: number;
  currency: string;
  status: InvoiceStatus;
  issue_date: string | null;
  due_date: string | null;
  invoice_number: string | null;
  issuer_contact: Record<string, unknown> | null;
  payer_contact: Record<string, unknown> | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
  lines: ApiInvoiceLine[];
  cancel_requests?: Array<{
    id: number;
    invoice_id: number;
    requested_by_id: number;
    reason: string | null;
    status: "pending" | "approved" | "rejected";
    resolved_by_id: number | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
  }>;
};

const mapInvoice = (invoice: ApiInvoice): Invoice => ({
  id: invoice.id,
  issuerAccountId: invoice.issuer_account_id,
  payerAccountId: invoice.payer_account_id,
  title: invoice.title,
  description: invoice.description,
  amountMinor: invoice.amount_minor,
  currency: invoice.currency,
  status: invoice.status,
  issueDate: invoice.issue_date,
  dueDate: invoice.due_date,
  invoiceNumber: invoice.invoice_number,
  issuerContact: invoice.issuer_contact,
  payerContact: invoice.payer_contact,
  memo: invoice.memo,
  createdAt: invoice.created_at,
  updatedAt: invoice.updated_at,
  lines: invoice.lines.map((line) => ({
    id: line.id,
    description: line.description,
    quantity: line.quantity,
    unitPriceMinor: line.unit_price_minor,
    position: line.position ?? undefined,
  })),
  cancelRequests: invoice.cancel_requests?.map((req) => ({
    id: req.id,
    invoiceId: req.invoice_id,
    requestedById: req.requested_by_id,
    reason: req.reason,
    status: req.status,
    resolvedById: req.resolved_by_id,
    resolvedAt: req.resolved_at,
    createdAt: req.created_at,
    updatedAt: req.updated_at,
  } as InvoiceCancelRequest)),
});

export const getInvoices = async (accountId: number): Promise<Invoice[]> => {
  const { data } = await apiClient.get<ApiInvoice[]>(`/api/v1/accounts/${accountId}/invoices`);
  return Array.isArray(data) ? data.map(mapInvoice) : [];
};

export const createInvoice = async (
  accountId: number,
  payload: InvoicePayload,
): Promise<Invoice> => {
  const { data } = await apiClient.post<ApiInvoice>(
    `/api/v1/accounts/${accountId}/invoices`,
    {
      invoice: {
        payer_account_id: payload.payerAccountId,
        title: payload.title,
        description: payload.description,
        currency: payload.currency ?? "JPY",
        issue_date: payload.issueDate,
        due_date: payload.dueDate,
        memo: payload.memo,
        lines: payload.lines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          unit_price_minor: line.unitPriceMinor,
          position: line.position,
        })),
      },
    },
  );

  return mapInvoice(data);
};

export const issueInvoice = async (accountId: number, invoiceId: number): Promise<Invoice> => {
  const { data } = await apiClient.patch<ApiInvoice>(
    `/api/v1/accounts/${accountId}/invoices/${invoiceId}/issue`,
  );
  return mapInvoice(data);
};

export const cancelRequest = async (
  accountId: number,
  invoiceId: number,
  reason?: string,
) => {
  const { data } = await apiClient.post(
    `/api/v1/accounts/${accountId}/invoices/${invoiceId}/cancel_requests`,
    { cancel_request: { reason } },
  );
  return data;
};

export const approveCancel = async (
  accountId: number,
  invoiceId: number,
  cancelRequestId: number,
) => {
  const { data } = await apiClient.patch(
    `/api/v1/accounts/${accountId}/invoices/${invoiceId}/cancel_requests/${cancelRequestId}/approve`,
  );
  return data;
};

export const rejectCancel = async (
  accountId: number,
  invoiceId: number,
  cancelRequestId: number,
) => {
  const { data } = await apiClient.patch(
    `/api/v1/accounts/${accountId}/invoices/${invoiceId}/cancel_requests/${cancelRequestId}/reject`,
  );
  return data;
};
