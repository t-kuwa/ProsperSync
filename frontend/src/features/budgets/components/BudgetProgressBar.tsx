import type { FC } from "react";

type BudgetProgressBarProps = {
  percentage: number;
  isOverrun: boolean;
};

const BudgetProgressBar: FC<BudgetProgressBarProps> = ({ percentage, isOverrun }) => {
  const clamped = Math.min(Math.max(percentage, 0), 200);
  const primaryWidth = Math.min(clamped, 100);
  const overflowWidth = clamped > 100 ? Math.min(clamped - 100, 100) : 0;

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all duration-300 ${
          isOverrun ? "bg-rose-500" : "bg-emerald-500"
        }`}
        style={{ width: `${primaryWidth}%` }}
      />
      {overflowWidth > 0 ? (
        <div
          className="ml-1 h-full rounded-full bg-rose-300 transition-all duration-300"
          style={{ width: `${overflowWidth}%` }}
        />
      ) : null}
    </div>
  );
};

export default BudgetProgressBar;
