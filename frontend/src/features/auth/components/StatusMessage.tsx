import type { Status } from "../types";

const statusStyles: Record<Status["type"], string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
};

export const StatusMessage = ({ status }: { status: Status }) => (
  <p
    className={`rounded-lg border px-4 py-3 text-sm transition ${statusStyles[status.type]}`}
  >
    {status.message}
  </p>
);

export default StatusMessage;
