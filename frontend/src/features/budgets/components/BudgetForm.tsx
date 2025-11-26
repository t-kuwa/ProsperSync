import { useEffect, useMemo, useState } from "react";
import type { Category } from "../../transactions/types";
import type { Budget, BudgetPayload, BudgetPeriodType } from "../types";
import RepeatBudgetModal from "./RepeatBudgetModal";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

type BudgetFormProps = {
  categories: Category[];
  processing: boolean;
  editing?: Budget | null;
  onSubmit: (payload: BudgetPayload, editing?: Budget | null) => Promise<void>;
  onCancel: () => void;
  variant?: "card" | "plain";
  showRepeatActions?: boolean;
  showHeader?: boolean;
};

const buildInitialPayload = (editing?: Budget | null): BudgetPayload => {
  if (!editing) {
    const today = new Date();
    return {
      category_id: null,
      amount: 0,
      period_type: "monthly",
      period_year: today.getFullYear(),
      period_month: today.getMonth() + 1,
      name: "",
      repeat_enabled: false,
      repeat_until_date: null,
    };
  }

  return {
    category_id: editing.categoryId,
    amount: editing.amount,
    period_type: editing.periodType,
    period_year: editing.periodYear,
    period_month: editing.periodMonth,
    name: editing.name,
    repeat_enabled: editing.repeatEnabled,
    repeat_until_date: editing.repeatUntilDate,
  };
};

const BudgetForm = ({
  categories,
  processing,
  editing,
  onSubmit,
  onCancel,
  variant = "card",
  showRepeatActions = true,
  showHeader = true,
}: BudgetFormProps) => {
  const [payload, setPayload] = useState<BudgetPayload>(() => buildInitialPayload(editing));
  const [amountInput, setAmountInput] = useState(() => String(buildInitialPayload(editing).amount));
  const [isRepeatModalOpen, setRepeatModalOpen] = useState(false);

  useEffect(() => {
    const nextPayload = buildInitialPayload(editing);
    setPayload(nextPayload);
    setAmountInput(String(nextPayload.amount));
  }, [editing]);

  useEffect(() => {
    if (payload.period_type === "yearly" && payload.period_month != null) {
      setPayload((prev) => ({ ...prev, period_month: null }));
    }
  }, [payload.period_type, payload.period_month]);

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );

  const isMonthly = payload.period_type === "monthly";

  const handleChange = <Key extends keyof BudgetPayload>(
    key: Key,
    value: BudgetPayload[Key],
  ) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(payload, editing ?? null);
  };

  const handleRepeatSubmit = (repeatPayload: BudgetPayload) => onSubmit(repeatPayload, null);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setAmountInput(value);
    const numericValue = Number(value || 0);
    setPayload((prev) => ({ ...prev, amount: Number.isFinite(numericValue) ? numericValue : prev.amount }));
  };

  const handleCancel = () => {
    const resetPayload = buildInitialPayload(editing);
    setPayload(resetPayload);
    setAmountInput(String(resetPayload.amount));
    onCancel();
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showHeader ? (
        <div className="text-left">
          <h2 className="text-lg font-semibold text-text-primary">
            {editing ? "予算を編集" : "新しい予算を作成"}
          </h2>
          <p className="text-sm text-text-secondary">
            カテゴリ別の支出上限と期間を設定して、進捗を可視化できます。
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="予算名（任意）"
          value={payload.name ?? ""}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="例: 11月の食費"
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-secondary">
            対象カテゴリ
          </label>
          <select
            value={payload.category_id ?? ""}
            onChange={(event) =>
              handleChange(
                "category_id",
                event.target.value ? Number(event.target.value) : null,
              )
            }
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
          >
            <option value="">全カテゴリ</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-secondary">
            期間タイプ
          </label>
          <select
            value={payload.period_type}
            onChange={(event) =>
              handleChange("period_type", event.target.value as BudgetPeriodType)
            }
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
          >
            <option value="monthly">月次</option>
            <option value="yearly">年次</option>
          </select>
        </div>

        <Input
          label="年"
          type="number"
          value={payload.period_year ?? ""}
          onChange={(event) => handleChange("period_year", Number(event.target.value))}
          min={2000}
        />

        {isMonthly ? (
          <Input
            label="月"
            type="number"
            value={payload.period_month ?? ""}
            onChange={(event) =>
              handleChange(
                "period_month",
                event.target.value ? Number(event.target.value) : null,
              )
            }
            min={1}
            max={12}
          />
        ) : null}

        <Input
          label="予算金額"
          type="number"
          value={amountInput}
          onChange={handleAmountChange}
          min={0}
          step={1000}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          onClick={handleCancel}
          variant="outline"
          size="sm"
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          disabled={processing}
          variant="primary"
          size="sm"
          isLoading={processing}
        >
          {editing ? "更新する" : "保存する"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className={variant === "card" ? "space-y-4" : "space-y-6"}>
      {variant === "card" ? (
        <Card className="p-6">{FormContent}</Card>
      ) : (
        FormContent
      )}
      
      {showRepeatActions ? (
        <>
          <Card className="p-4 text-center">
            <p className="text-sm text-text-secondary">
              繰り返し発生する予算は専用モーダルからまとめて作成できます。
            </p>
            <Button
              type="button"
              onClick={() => setRepeatModalOpen(true)}
              variant="secondary"
              size="sm"
              className="mt-3"
            >
              <span className="material-icons text-base mr-1">repeat</span>
              繰り返し予算を作成する
            </Button>
          </Card>

          <RepeatBudgetModal
            open={isRepeatModalOpen}
            onClose={() => setRepeatModalOpen(false)}
            onSubmit={handleRepeatSubmit}
            categories={categories}
            processing={processing}
          />
        </>
      ) : null}
    </div>
  );
};

export default BudgetForm;
