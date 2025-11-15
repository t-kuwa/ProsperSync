import { useEffect, useMemo, useState } from "react";
import type { Category } from "../../transactions/types";
import type { Budget, BudgetPayload, BudgetPeriodType } from "../types";

type BudgetFormProps = {
  categories: Category[];
  processing: boolean;
  editing?: Budget | null;
  onSubmit: (payload: BudgetPayload, editing?: Budget | null) => Promise<void>;
  onCancel: () => void;
};

const buildInitialPayload = (editing?: Budget | null): BudgetPayload => {
  if (!editing) {
    const today = new Date();
    return {
      category_id: null,
      amount: 50_000,
      period_type: "monthly",
      period_year: today.getFullYear(),
      period_month: today.getMonth() + 1,
      name: "",
    };
  }

  return {
    category_id: editing.categoryId,
    amount: editing.amount,
    period_type: editing.periodType,
    period_year: editing.periodYear,
    period_month: editing.periodMonth,
    name: editing.name,
  };
};

const BudgetForm = ({
  categories,
  processing,
  editing,
  onSubmit,
  onCancel,
}: BudgetFormProps) => {
  const [payload, setPayload] = useState<BudgetPayload>(() => buildInitialPayload(editing));

  useEffect(() => {
    setPayload(buildInitialPayload(editing));
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <div className="text-left">
        <h2 className="text-lg font-semibold text-slate-900">
          {editing ? "予算を編集" : "新しい予算を作成"}
        </h2>
        <p className="text-sm text-slate-500">
          カテゴリ別の支出上限と期間を設定して、進捗を可視化できます。
        </p>
      </div>

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
            value={payload.amount}
            onChange={(event) => handleChange("amount", Number(event.target.value))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            min={0}
            step={1000}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
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
  );
};

export default BudgetForm;
