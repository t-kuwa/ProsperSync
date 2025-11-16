import type { FC } from "react";

type BudgetProgressCircleProps = {
  percentage: number;
  isOverrun: boolean;
};

const BudgetProgressCircle: FC<BudgetProgressCircleProps> = ({ percentage, isOverrun }) => {
  const normalized = Math.max(0, Math.min(Number.isFinite(percentage) ? percentage : 0, 200));
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(normalized, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const overflowPercent = normalized > 100 ? normalized - 100 : 0;

  return (
    <div className="relative h-28 w-28 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          className="text-slate-100"
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={isOverrun ? "text-rose-500" : "text-emerald-500"}
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-2xl font-semibold ${isOverrun ? "text-rose-600" : "text-slate-900"}`}>
          {percentage.toFixed(0)}%
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">進捗</span>
      </div>

      {overflowPercent > 0 ? (
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-600 shadow-sm">
          超過 +{overflowPercent.toFixed(0)}%
        </span>
      ) : null}
    </div>
  );
};

export default BudgetProgressCircle;
