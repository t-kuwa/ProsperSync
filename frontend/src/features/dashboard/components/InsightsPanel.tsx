import formatCurrency from "../utils/formatCurrency";

type InsightsPanelProps = {
  inflowOutflowRatio: number;
  totalAccountBalance: number;
  className?: string;
};

const InsightsPanel = ({
  inflowOutflowRatio,
  totalAccountBalance,
  className,
}: InsightsPanelProps) => (
  <div
    className={`relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-xl shadow-slate-900/10 ring-1 ring-white/60 ${className ?? ""}`}
  >
    <div
      className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/40 blur-3xl"
      aria-hidden
    />
    <h2 className="text-lg font-semibold text-slate-900">インサイト</h2>

    <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl bg-white/70 p-6 shadow-inner">
      <DonutMeter
        label="支出率"
        percentage={inflowOutflowRatio}
        description="収入に対する支出の割合"
      />
      <div className="text-center text-sm text-slate-500">
        支出率が70%を超えた場合はアラート設定で通知することをおすすめします。
      </div>
    </div>

    <div className="space-y-3 text-sm">
      <InsightItem
        label="キャッシュ残高"
        value={formatCurrency(totalAccountBalance)}
        description="全アカウント合算の現在残高"
      />
    </div>
  </div>
);

type DonutMeterProps = {
  label: string;
  percentage: number;
  description?: string;
};

const DonutMeter = ({ label, percentage, description }: DonutMeterProps) => {
  const normalized = Math.min(100, Math.max(0, percentage));
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (normalized / 100) * circumference;
  const color =
    normalized > 70
      ? "stroke-rose-500"
      : normalized > 40
        ? "stroke-indigo-500"
        : "stroke-emerald-500";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <circle
            cx="60"
            cy="60"
            r="45"
            className="stroke-slate-200"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            className={`${color} transition-all duration-500`}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-slate-900">
            {normalized}%
          </span>
          <span className="text-xs text-slate-500">{label}</span>
        </div>
      </div>
      {description ? (
        <p className="text-center text-xs text-slate-500">{description}</p>
      ) : null}
    </div>
  );
};

type InsightItemProps = {
  label: string;
  value: string;
  description: string;
};

const InsightItem = ({ label, value, description }: InsightItemProps) => (
  <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-inner shadow-slate-900/5">
    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <p className="mt-1 text-xs text-slate-500">{description}</p>
  </div>
);

export default InsightsPanel;
