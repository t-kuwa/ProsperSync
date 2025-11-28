import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import {
  approveCancel,
  cancelRequest,
  createInvoice,
  getInvoices,
  issueInvoice,
  rejectCancel,
} from "../../../api/invoices";
import useAccountState from "../../accounts/hooks/useAccountState";
import type {
  Invoice,
  InvoiceFilterState,
  InvoicePayload,
  InvoiceStatus,
} from "../types";

const DEFAULT_FILTERS: InvoiceFilterState = {
  status: "all",
  role: "all",
  search: "",
};

const useInvoices = () => {
  const { currentAccountId } = useAccountState();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState<InvoiceFilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!currentAccountId) {
      setInvoices([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getInvoices(currentAccountId);
      setInvoices(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [currentAccountId]);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (filters.status !== "all" && invoice.status !== filters.status) return false;
      if (filters.role === "issuer" && invoice.issuerAccountId !== currentAccountId) return false;
      if (filters.role === "payer" && invoice.payerAccountId !== currentAccountId) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const text = `${invoice.title} ${invoice.invoiceNumber || ""} ${invoice.description || ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [filters, invoices, currentAccountId]);

  const updateFilters = useCallback(
    <K extends keyof InvoiceFilterState>(key: K, value: InvoiceFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const create = useCallback(
    async (payload: InvoicePayload) => {
      if (!currentAccountId) return;
      setProcessing(true);
      setError(null);
      try {
        await createInvoice(currentAccountId, payload);
        await fetchInvoices();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, fetchInvoices],
  );

  const issue = useCallback(
    async (invoice: Invoice) => {
      if (!currentAccountId) return;
      setProcessing(true);
      setError(null);
      try {
        await issueInvoice(currentAccountId, invoice.id);
        await fetchInvoices();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, fetchInvoices],
  );

  const requestCancel = useCallback(
    async (invoice: Invoice, reason?: string) => {
      if (!currentAccountId) return;
      setProcessing(true);
      setError(null);
      try {
        await cancelRequest(currentAccountId, invoice.id, reason);
        await fetchInvoices();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, fetchInvoices],
  );

  const resolveCancel = useCallback(
    async (invoice: Invoice, cancelRequestId: number, approve: boolean) => {
      if (!currentAccountId) return;
      setProcessing(true);
      setError(null);
      try {
        if (approve) {
          await approveCancel(currentAccountId, invoice.id, cancelRequestId);
        } else {
          await rejectCancel(currentAccountId, invoice.id, cancelRequestId);
        }
        await fetchInvoices();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setProcessing(false);
      }
    },
    [currentAccountId, fetchInvoices],
  );

  return {
    invoices,
    filteredInvoices,
    filters,
    loading,
    processing,
    error,
    updateFilters,
    resetFilters,
    refresh: fetchInvoices,
    create,
    issue,
    requestCancel,
    resolveCancel,
  };
};

export default useInvoices;
