import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import formatCurrency from "../../dashboard/utils/formatCurrency";
import type { Invoice } from "../types";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

type Props = {
  invoice: Invoice | null;
  onClose: () => void;
  onIssue: (invoice: Invoice) => Promise<void>;
  onCancelRequest: (invoice: Invoice) => Promise<void>;
  onApprove: (invoice: Invoice, cancelRequestId: number) => Promise<void>;
  onReject: (invoice: Invoice, cancelRequestId: number) => Promise<void>;
  currentAccountId: number | null;
  processing: boolean;
};

const InvoiceDetailModal = ({
  invoice,
  onClose,
  onIssue,
  onCancelRequest,
  onApprove,
  onReject,
  currentAccountId,
  processing,
}: Props) => {
  if (!invoice) return null;

  const isIssuer = invoice.issuerAccountId === currentAccountId;
  const cancelRequest = invoice.status === "cancel_pending" ? invoice.cancelRequests?.[0] : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs text-text-secondary">請求書詳細</p>
            <h3 className="text-2xl font-bold text-text-primary">{invoice.title}</h3>
            <div className="flex items-center gap-2">
              <InvoiceStatusBadge status={invoice.status} />
              {invoice.invoiceNumber ? (
                <span className="text-xs text-text-secondary">No. {invoice.invoiceNumber}</span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="p-4 border border-border/70">
            <p className="text-xs font-semibold text-text-secondary">発行側</p>
            <p className="text-sm text-text-primary">{invoice.issuerAccount?.name ?? invoice.issuerAccountId}</p>
          </Card>
          <Card className="p-4 border border-border/70">
            <p className="text-xs font-semibold text-text-secondary">支払側</p>
            <p className="text-sm text-text-primary">{invoice.payerAccount?.name ?? invoice.payerAccountId}</p>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
          <Card className="p-0 overflow-hidden border border-border/80">
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">明細</span>
              <span className="text-sm text-text-secondary">
                合計: <span className="font-semibold text-text-primary">{formatCurrency(invoice.amountMinor)}</span>
              </span>
            </div>
            <div className="divide-y divide-border/70">
              {invoice.lines.map((line) => (
                <div key={line.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                  <div className="col-span-6 font-semibold text-text-primary">{line.description}</div>
                  <div className="col-span-2 text-text-secondary">数量 {line.quantity}</div>
                  <div className="col-span-4 text-right text-text-primary">
                    {formatCurrency(line.unitPriceMinor * line.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 border border-border/80 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">発行日</span>
              <span className="text-text-primary">{invoice.issueDate || "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">期日</span>
              <span className="text-text-primary">{invoice.dueDate || "-"}</span>
            </div>
            <div className="text-sm text-text-secondary">{invoice.description}</div>
            <div className="text-sm text-text-secondary">{invoice.memo}</div>
          </Card>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          {invoice.status === "draft" && isIssuer ? (
            <Button variant="primary" size="sm" isLoading={processing} onClick={() => onIssue(invoice)}>
              発行する
            </Button>
          ) : null}

          {invoice.status === "issued" && isIssuer ? (
            <Button variant="outline" size="sm" isLoading={processing} onClick={() => onCancelRequest(invoice)}>
              キャンセル申請
            </Button>
          ) : null}

          {invoice.status === "cancel_pending" && cancelRequest && isIssuer ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                isLoading={processing}
                onClick={() => onReject(invoice, cancelRequest.id)}
              >
                却下
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={processing}
                onClick={() => onApprove(invoice, cancelRequest.id)}
              >
                承認してキャンセル
              </Button>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetailModal;
