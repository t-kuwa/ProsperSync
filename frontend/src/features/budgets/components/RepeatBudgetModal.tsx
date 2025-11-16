import { useEffect, useMemo, useState } from "react";
import type { Category } from "../../transactions/types";
import type { BudgetPayload, BudgetPeriodType } from "../types";

type RepeatBudgetModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: BudgetPayload) => Promise<void>;
  categories: Category[];
  processing: boolean;
};

const buildInitialPayload = (): BudgetPayload => {
  const today = new Date();
  const base: BudgetPayload = {
    category_id: null,
    amount: 0,
    period_type: "monthly",
    period_year: today.getFullYear(),
    period_month: today.getMonth() + 1,
    name: "",
    repeat_enabled: true,
  };

  return {
    ...base,
    repeat_until_date: calculateDefaultRepeatUntil(base.period_type, base.period_year, base.period_month ?? 1),
  };
};

const RepeatBudgetModal = ({ open, onClose, onSubmit, categories, processing }: RepeatBudgetModalProps) => {
  const [payload, setPayload] = useState<BudgetPayload>(buildInitialPayload);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setPayload(buildInitialPayload());
    setValidationError(null);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (payload.period_type === "yearly" && payload.period_month != null) {
      setPayload((prev) => ({ ...prev, period_month: null }));
    }
  }, [payload.period_type, payload.period_month]);

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );

  if (!open) {
    return null;
  }

  const isMonthly = payload.period_type === "monthly";
  const minDate = formatDate(addDays(getPeriodEndDate(payload), 1));

  const handleChange = <Key extends keyof BudgetPayload>(key: Key, value: BudgetPayload[Key]) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
    setValidationError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validateRepeatPayload(payload);
    if (error) {
      setValidationError(error);
      return;
    }
    await onSubmit(payload);
    onClose();
  };

  const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/40 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-full rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:max-w-2xl lg:max-w-3xl lg:p-8"
        onClick={handleWrapperClick}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Repeat Budget</p>
            <h2 className="text-xl font-semibold text-slate-900">繰り返し予算を作成</h2>
            <p className="text-sm text-slate-500">
              開始期間から終了日までの不足分を自動生成します。後から各月の予算を個別に調整できます。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:gap-8">
          <section className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50 via-white to-indigo-50 p-5 text-xs text-indigo-700 shadow-sm lg:w-[260px] lg:flex-shrink-0">
            <div className="space-y-4 text-left">
              <div>
                <p className="text-sm font-semibold text-indigo-800">繰り返し設定</p>
                <p className="text-[12px] leading-relaxed text-indigo-600">
                  選択した期間と終了日をもとに、足りない月・年の予算を自動で複製します。定期的な支出をまとめて準備できます。
                </p>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-4 text-[12px] text-indigo-700 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <span className="material-icons text-sm">lightbulb</span>
                  </span>
                  <p className="text-sm font-semibold text-indigo-800">Tips</p>
                </div>
                <p className="mt-2 leading-relaxed text-indigo-700">
                  作成後は各期間の予算を個別に編集・削除できます。長期の計画も安心です。
                </p>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto lg:max-h-[70vh]">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-600">
                予算名（任意）
                <input
                  value={payload.name ?? ""}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="例: 住宅ローン"
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

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                繰り返し終了日
                <input
                  type="date"
                  value={payload.repeat_until_date ?? ""}
                  onChange={(event) => handleChange("repeat_until_date", event.target.value || null)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  min={minDate}
                  required
                />
                <span className="text-xs text-slate-500">
                  {isMonthly ? "開始月の翌月以降を選択してください" : "開始年の翌年以降を選択してください"}
                </span>
              </label>
            </div>

            {validationError ? (
              <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {validationError}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={processing}
                className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {processing ? "作成中…" : "この設定で作成"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RepeatBudgetModal;

const addMonths = (date: Date, months: number) => {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
};

const endOfMonth = (year: number, month: number) => new Date(year, month, 0);

const endOfYear = (year: number) => new Date(year, 12, 0);

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateDefaultRepeatUntil = (
  periodType: BudgetPeriodType,
  year: number,
  month: number,
) => {
  if (periodType === "monthly") {
    const start = new Date(year, month - 1, 1);
    const future = addMonths(start, 3);
    return formatDate(endOfMonth(future.getFullYear(), future.getMonth() + 1));
  }

  return formatDate(endOfYear(year + 1));
};

const getPeriodEndDate = (payload: BudgetPayload) => {
  if (payload.period_type === "monthly" && payload.period_month) {
    return endOfMonth(payload.period_year, payload.period_month);
  }
  return endOfYear(payload.period_year);
};

const validateRepeatPayload = (payload: BudgetPayload) => {
  if (!payload.repeat_until_date) {
    return "終了日を選択してください。";
  }
  const untilDate = new Date(payload.repeat_until_date);
  if (Number.isNaN(untilDate.getTime())) {
    return "終了日の形式が正しくありません。";
  }
  const minDate = addDays(getPeriodEndDate(payload), 1);
  if (untilDate < minDate) {
    return payload.period_type === "monthly"
      ? "終了日は開始月より後の日付を選択してください。"
      : "終了日は開始年より後の日付を選択してください。";
  }
  return null;
};
