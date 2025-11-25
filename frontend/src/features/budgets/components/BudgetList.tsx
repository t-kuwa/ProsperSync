import type { FC } from "react";
import type { Budget } from "../types";
import BudgetCard from "./BudgetCard";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

type BudgetListProps = {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
};

const BudgetList: FC<BudgetListProps> = ({
  budgets,
  loading,
  error,
  onRetry,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <Card className="p-8 text-center text-text-secondary">
        予算データを読み込んでいます…
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-red-100 bg-red-50">
        <p className="text-sm text-red-600">{error}</p>
        <Button
          type="button"
          onClick={onRetry}
          variant="primary"
          size="sm"
          className="mt-4 bg-red-600 hover:bg-red-500"
        >
          もう一度試す
        </Button>
      </Card>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-text-secondary">
        まだ予算が登録されていません。左側のフォームから作成できます。
      </Card>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {budgets.map((budget) => (
        <div key={budget.id} className="flex">
          <BudgetCard budget={budget} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
};

export default BudgetList;
