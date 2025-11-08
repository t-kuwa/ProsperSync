import type { Status } from "../types";

const statusStyles: Record<Status["type"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

export const StatusMessage = ({ status }: { status: Status }) => (
  <p
    className={`rounded-xl border px-4 py-3 text-sm transition ${statusStyles[status.type]}`}
  >
    {status.message}
  </p>
);

export default StatusMessage;
