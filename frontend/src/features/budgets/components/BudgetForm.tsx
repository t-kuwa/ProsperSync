import { useEffect, useMemo, useState } from "react";
import type { Category } from "../../transactions/types";
import type { Budget, BudgetPayload, BudgetPeriodType } from "../types";
import RepeatBudgetModal from "./RepeatBudgetModal";

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

  const wrapperClassName =
    variant === "card"
      ? "space-y-4"
      : variant === "plain"
        ? "space-y-6"
        : "";
  const formClassName =
    variant === "card"
      ? "space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      : "space-y-4";

  return (
    <div className={wrapperClassName}>
      <form onSubmit={handleSubmit} className={formClassName}>
        {showHeader ? (
          <div className="text-left">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing ? "予算を編集" : "新しい予算を作成"}
            </h2>
            <p className="text-sm text-slate-500">
              カテゴリ別の支出上限と期間を設定して、進捗を可視化できます。
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            予算名（任意）
            <input
              value={payload.name ?? ""}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="例: 11月の食費"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-600">
            対象カテゴリ
            <select
              value={payload.category_id ?? ""}
              onChange={(event) =>
                handleChange(
                  "category_id",
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">全カテゴリ</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-600">
            期間タイプ
            <select
              value={payload.period_type}
              onChange={(event) =>
                handleChange("period_type", event.target.value as BudgetPeriodType)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="monthly">月次</option>
              <option value="yearly">年次</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-600">
            年
            <input
              type="number"
              value={payload.period_year ?? ""}
              onChange={(event) => handleChange("period_year", Number(event.target.value))}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              min={2000}
            />
          </label>

          {isMonthly ? (
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              月
              <input
                type="number"
                value={payload.period_month ?? ""}
                onChange={(event) =>
                  handleChange(
                    "period_month",
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                min={1}
                max={12}
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-2 text-sm text-slate-600">
            予算金額
            <input
              type="number"
              value={amountInput}
              onChange={handleAmountChange}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              min={0}
              step={1000}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={processing}
            className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {processing ? "保存中…" : editing ? "更新する" : "保存する"}
          </button>
        </div>
      </form>
      {showRepeatActions ? (
        <>
          <div className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-600">
              繰り返し発生する予算は専用モーダルからまとめて作成できます。
            </p>
            <button
              type="button"
              onClick={() => setRepeatModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100"
            >
              <span className="material-icons text-base">repeat</span>
              繰り返し予算を作成する
            </button>
          </div>

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
