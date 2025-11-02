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
    className={`flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className ?? ""}`}
  >
    <h2 className="text-lg font-semibold text-slate-900">インサイト</h2>

    <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl bg-slate-50 p-6">
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
        label="経費の増加"
        value="+18.3%"
        description="マーケティング費用が前月比で増加しています。"
      />
      <InsightItem
        label="安定した収入"
        value="+9.1%"
        description="継続課金が順調に増加しています。"
      />
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
  <div className="rounded-2xl border border-slate-200 px-4 py-3">
    <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <p className="mt-1 text-xs text-slate-500">{description}</p>
  </div>
);

export default InsightsPanel;
