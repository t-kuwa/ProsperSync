import { useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import useAccountState from "../accounts/hooks/useAccountState";
import useInvoices from "./hooks/useInvoices";
import InvoiceStatusBadge from "./components/InvoiceStatusBadge";
import InvoiceFormModal from "./components/InvoiceFormModal";
import InvoiceDetailModal from "./components/InvoiceDetailModal";
import type { Invoice, InvoiceStatus } from "./types";
import formatCurrency from "../dashboard/utils/formatCurrency";

const statusOptions: Array<{ value: InvoiceStatus | "all"; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "draft", label: "下書き" },
  { value: "issued", label: "発行済み" },
  { value: "cancel_pending", label: "キャンセル申請中" },
  { value: "canceled", label: "キャンセル済み" },
];

const roleOptions = [
  { value: "all", label: "すべて" },
  { value: "issuer", label: "発行した" },
  { value: "payer", label: "受け取った" },
];

const InvoicesPage = () => {
  const { accounts, currentAccount, currentAccountId } = useAccountState();
  const {
    invoices,
    filteredInvoices,
    filters,
    loading,
    processing,
    error,
    updateFilters,
    resetFilters,
    refresh,
    create,
    issue,
    requestCancel,
    resolveCancel,
  } = useInvoices();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);

  const totals = useMemo(() => {
    const issuedCount = invoices.filter((inv) => inv.status === "issued").length;
    const pendingCount = invoices.filter((inv) => inv.status === "cancel_pending").length;
    const draftCount = invoices.filter((inv) => inv.status === "draft").length;
    return { issuedCount, pendingCount, draftCount };
  }, [invoices]);

  if (!currentAccount) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center text-text-secondary">
          サイドバーからアカウントを選択してください。
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-text-primary">請求書</h1>
          <p className="text-sm text-text-secondary">ワークスペース間で請求書を作成・発行・キャンセル申請できます。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refresh()} disabled={loading}>
            <span className="material-icons text-base mr-1">refresh</span>
            再読み込み
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            <span className="material-icons text-base mr-1">add</span>
            請求書を作成
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-text-secondary font-semibold">発行済み</p>
          <p className="text-2xl font-bold text-text-primary">{totals.issuedCount} 件</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-secondary font-semibold">キャンセル申請中</p>
          <p className="text-2xl font-bold text-text-primary">{totals.pendingCount} 件</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-secondary font-semibold">下書き</p>
          <p className="text-2xl font-bold text-text-primary">{totals.draftCount} 件</p>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-text-secondary">
            ステータス
            <select
              value={filters.status}
              onChange={(e) => updateFilters("status", e.target.value as InvoiceStatus | "all")}
              className="ml-2 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-text-secondary">
            役割
            <select
              value={filters.role}
              onChange={(e) => updateFilters("role", e.target.value as typeof filters.role)}
              className="ml-2 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => updateFilters("search", e.target.value)}
            placeholder="タイトル/番号で検索"
            className="w-64 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
          />
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            リセット
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/70">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">発行者 → 支払者</th>
                <th className="px-4 py-3 text-right">金額</th>
                <th className="px-4 py-3">ステータス</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-background">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-text-primary">{invoice.title}</div>
                    <div className="text-xs text-text-secondary">No. {invoice.invoiceNumber || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    <div>
                      {invoice.issuerAccount?.name ?? `#${invoice.issuerAccountId}`} →{" "}
                      {invoice.payerAccount?.name ?? `#${invoice.payerAccountId}`}
                    </div>
                    <div className="text-xs">期日: {invoice.dueDate || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-text-primary">
                    {formatCurrency(invoice.amountMinor)}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(invoice)}>
                      詳細
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 ? (
            <div className="p-6 text-center text-text-secondary text-sm">請求書がありません。</div>
          ) : null}
        </div>
      </Card>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <InvoiceFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={create}
        accounts={accounts}
        currentAccountId={currentAccountId}
        processing={processing}
      />

      <InvoiceDetailModal
        invoice={selected}
        onClose={() => setSelected(null)}
        onIssue={issue}
        onCancelRequest={(invoice) => requestCancel(invoice)}
        onApprove={(invoice, cancelRequestId) => resolveCancel(invoice, cancelRequestId, true)}
        onReject={(invoice, cancelRequestId) => resolveCancel(invoice, cancelRequestId, false)}
        currentAccountId={currentAccountId}
        processing={processing}
      />
    </div>
  );
};

export default InvoicesPage;
