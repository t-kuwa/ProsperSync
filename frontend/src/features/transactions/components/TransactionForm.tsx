import { useEffect, useMemo, useState } from "react";
import formatCurrency from "../../dashboard/utils/formatCurrency";
import { getErrorMessage } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import type {
  Category,
  Transaction,
  TransactionPayload,
  TransactionType,
} from "../types";

type FormState = {
  type: TransactionType;
  title: string;
  amount: string;
  date: string;
  memo: string;
  categoryId: string;
};

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const INITIAL_STATE: FormState = {
  type: "expense",
  title: "",
  amount: "",
  date: getTodayDate(),
  memo: "",
  categoryId: "",
};

type TransactionFormProps = {
  categories: Category[];
  loadingCategories: boolean;
  processing: boolean;
  editingTransaction: Transaction | null;
  onSubmit: (
    payload: TransactionPayload,
    editing: Transaction | null,
  ) => Promise<void>;
  onCancelEdit?: () => void;
  onRequestNewCategory?: (type: TransactionType) => void;
};

const TransactionForm = ({
  categories,
  loadingCategories,
  processing,
  editingTransaction,
  onSubmit,
  onCancelEdit,
  onRequestNewCategory,
}: TransactionFormProps) => {
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<keyof FormState, string | null>>({
    type: null,
    title: null,
    amount: null,
    date: null,
    memo: null,
    categoryId: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setFormState({
        type: editingTransaction.resourceType,
        title: editingTransaction.title,
        amount: editingTransaction.amount.toLocaleString("ja-JP"),
        date: editingTransaction.date,
        memo: editingTransaction.memo ?? "",
        categoryId: String(editingTransaction.category.id),
      });
      setErrors({
        type: null,
        title: null,
        amount: null,
        date: null,
        memo: null,
        categoryId: null,
      });
      setSubmitError(null);
    } else {
      setFormState(INITIAL_STATE);
      setSubmitError(null);
    }
  }, [editingTransaction]);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === formState.type),
    [categories, formState.type],
  );

  const formattedPreview = useMemo(() => {
    const numeric = Number(formState.amount.replace(/,/g, ""));
    if (Number.isNaN(numeric) || numeric <= 0) {
      return "¥0";
    }
    return formatCurrency(numeric);
  }, [formState.amount]);

  const handleFieldChange = <Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
    setSubmitError(null);
  };

  const handleTypeChange = (type: TransactionType) => {
    if (editingTransaction) {
      return;
    }

    setFormState((prev) => ({
      ...INITIAL_STATE,
      type,
      date: prev.date,
    }));
    setErrors({
      type: null,
      title: null,
      amount: null,
      date: null,
      memo: null,
      categoryId: null,
    });
    setSubmitError(null);
  };

  const formatAmountInput = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) {
      return "";
    }
    return Number(digits).toLocaleString("ja-JP");
  };

  const validate = () => {
    const nextErrors: Record<keyof FormState, string | null> = {
      type: null,
      title: null,
      amount: null,
      date: null,
      memo: null,
      categoryId: null,
    };

    if (!formState.title.trim()) {
      nextErrors.title = "タイトルを入力してください。";
    }

    const numericAmount = Number(formState.amount.replace(/,/g, ""));
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = "金額は1円以上の数値で入力してください。";
    }

    if (!formState.date) {
      nextErrors.date = "日付を入力してください。";
    }

    if (!formState.categoryId) {
      nextErrors.categoryId = "カテゴリを選択してください。";
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setErrors(nextErrors);
      return null;
    }

    return {
      amount: numericAmount,
      categoryId: Number(formState.categoryId),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = validate();

    if (!normalized) {
      return;
    }

    const payload: TransactionPayload = {
      type: formState.type,
      title: formState.title.trim(),
      amount: normalized.amount,
      date: formState.date,
      memo: formState.memo.trim() || undefined,
      categoryId: normalized.categoryId,
    };

    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(payload, editingTransaction);
      if (editingTransaction) {
        onCancelEdit?.();
      }
      setFormState((prev) => ({
        ...INITIAL_STATE,
        type: prev.type,
        date: prev.date,
      }));
      setSubmitError(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setSubmitError(errorMessage);
      console.error("TransactionForm submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const disableSubmit = submitting || processing || loadingCategories;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">収支を登録</h2>
        </div>
        <div className="text-right text-xs text-text-secondary">
          今回の入力金額
          <p className="text-base font-semibold text-text-primary">
            {formattedPreview}
          </p>
        </div>
      </div>

      {editingTransaction ? (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span>
            「{editingTransaction.title}」を編集しています。
          </span>
          <button
            type="button"
            className="text-xs font-semibold text-amber-800 underline-offset-4 hover:underline"
            onClick={onCancelEdit}
          >
            編集をキャンセル
          </button>
        </div>
      ) : null}

      {submitError ? (
        <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
          {submitError}
        </p>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-xl bg-surface p-1 text-sm font-medium text-text-secondary border border-border">
          {(["income", "expense"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 transition ${
                formState.type === type
                  ? type === "income"
                    ? "bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-200"
                    : "bg-white text-rose-600 shadow-sm ring-1 ring-rose-200"
                  : "hover:text-text-primary hover:bg-background"
              } ${editingTransaction ? "cursor-not-allowed opacity-70" : ""}`}
              onClick={() => handleTypeChange(type)}
              disabled={Boolean(editingTransaction)}
            >
              {type === "income" ? "収入" : "支出"}
            </button>
          ))}
        </div>

        <Input
          label="タイトル"
          value={formState.title}
          onChange={(event) => handleFieldChange("title", event.target.value)}
          placeholder="例: サブスクリプション売上 / オフィス家賃"
          error={errors.title || undefined}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              金額
            </label>
            <div className={`flex items-center rounded-xl border px-3 py-2 bg-background ${errors.amount ? "border-red-300" : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"}`}>
              <span className="text-text-secondary">¥</span>
              <input
                value={formState.amount}
                onChange={(event) =>
                  handleFieldChange("amount", formatAmountInput(event.target.value))
                }
                inputMode="decimal"
                placeholder="0"
                className="ml-2 w-full border-none bg-transparent text-sm outline-none focus:ring-0 text-text-primary placeholder:text-text-secondary/50"
              />
            </div>
            {errors.amount ? (
              <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
            ) : null}
          </div>

          <Input
            label="日付"
            type="date"
            value={formState.date}
            onChange={(event) => handleFieldChange("date", event.target.value)}
            error={errors.date || undefined}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-text-secondary">
              カテゴリ
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => onRequestNewCategory?.(formState.type)}
            >
              新しいカテゴリを作成
            </button>
          </div>
          {loadingCategories ? (
            <div className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
              カテゴリを読み込み中...
            </div>
          ) : availableCategories.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
              該当するカテゴリがありません
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 ${
                errors.categoryId ? "rounded-xl border border-red-300 p-1" : ""
              }`}
            >
              {availableCategories.map((category) => {
                const isSelected = formState.categoryId === String(category.id);
                const categoryColor = category.color ?? "#cbd5f5";
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleFieldChange("categoryId", String(category.id))}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20"
                        : "border-border bg-background text-text-secondary hover:border-primary/30 hover:bg-surface"
                    }`}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: categoryColor }}
                    />
                    <span className="truncate">{category.name}</span>
                  </button>
                );
              })}
            </div>
          )}
          {errors.categoryId ? (
            <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            メモ
          </label>
          <textarea
            value={formState.memo}
            onChange={(event) => handleFieldChange("memo", event.target.value)}
            placeholder="支払い方法や簡単な補足などを残せます。"
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary placeholder:text-text-secondary/50"
          />
        </div>

        <Button
          type="submit"
          disabled={disableSubmit}
          className="w-full"
          variant="primary"
          isLoading={submitting}
        >
          {editingTransaction ? "収支を更新" : "収支を登録"}
        </Button>
      </form>
    </Card>
  );
};

export default TransactionForm;
