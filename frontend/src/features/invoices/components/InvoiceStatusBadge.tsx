import type { InvoiceStatus } from "../types";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  issued: "bg-blue-50 text-blue-700 border-blue-100",
  cancel_pending: "bg-amber-50 text-amber-700 border-amber-100",
  canceled: "bg-slate-200 text-slate-700 border-slate-300",
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "下書き",
  issued: "発行済み",
  cancel_pending: "キャンセル申請中",
  canceled: "キャンセル済み",
};

type Props = {
  status: InvoiceStatus;
};

const InvoiceStatusBadge = ({ status }: Props) => (
  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
    {STATUS_LABELS[status]}
  </span>
);

export default InvoiceStatusBadge;
