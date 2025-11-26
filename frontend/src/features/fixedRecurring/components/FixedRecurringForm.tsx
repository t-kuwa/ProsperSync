import { useEffect, useMemo, useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import type { Category } from "../../transactions/types";
import type {
  FixedRecurringEntry,
  FixedRecurringEntryFormValues,
  FixedRecurringEntryPayload,
} from "../types";

type FixedRecurringFormProps = {
  categories: Category[];
  processing: boolean;
  editing?: FixedRecurringEntry | null;
  onSubmit: (payload: FixedRecurringEntryPayload, editing?: FixedRecurringEntry | null) => Promise<void>;
  onCancelEdit?: () => void;
};

const buildInitialValues = (editing?: FixedRecurringEntry | null): FixedRecurringEntryFormValues => {
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  if (!editing) {
    return {
      title: "",
      kind: "expense",
      amount: "",
      dayOfMonth: 25,
      useEndOfMonth: true,
      effectiveFromMonth: defaultMonth,
      effectiveToMonth: "",
      categoryId: "",
      memo: "",
    };
  }

  const toMonthValue = (dateString: string | null) =>
    dateString ? dateString.slice(0, 7) : "";

  return {
    title: editing.title,
    kind: editing.kind,
    amount: editing.amount,
    dayOfMonth: editing.dayOfMonth,
    useEndOfMonth: editing.useEndOfMonth,
    effectiveFromMonth: toMonthValue(editing.effectiveFrom),
    effectiveToMonth: toMonthValue(editing.effectiveTo),
    categoryId: editing.categoryId,
    memo: editing.memo ?? "",
  };
};

const FixedRecurringForm = ({
  categories,
  processing,
  editing = null,
  onSubmit,
  onCancelEdit,
}: FixedRecurringFormProps) => {
  const [values, setValues] = useState<FixedRecurringEntryFormValues>(() => buildInitialValues(editing));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(buildInitialValues(editing));
  }, [editing]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === values.kind),
    [categories, values.kind],
  );

  const handleChange = <K extends keyof FixedRecurringEntryFormValues>(
    key: K,
    value: FixedRecurringEntryFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const toDateString = (monthValue: string) =>
    monthValue ? `${monthValue}-01` : null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.categoryId) {
      setError("カテゴリを選択してください");
      return;
    }
    if (!values.effectiveFromMonth) {
      setError("開始月を指定してください");
      return;
    }

    const payload: FixedRecurringEntryPayload = {
      title: values.title.trim() || "無題の固定収支",
      kind: values.kind,
      amount: Number(values.amount) || 0,
      dayOfMonth: Number(values.dayOfMonth) || 1,
      useEndOfMonth: values.useEndOfMonth,
      effectiveFrom: toDateString(values.effectiveFromMonth) ?? "",
      effectiveTo: toDateString(values.effectiveToMonth),
      categoryId: Number(values.categoryId),
      memo: values.memo || undefined,
    };

    await onSubmit(payload, editing);
  };

  return (
    <Card className="p-6 shadow-soft border border-white/70">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">Fixed Plan</p>
          <h2 className="text-xl font-semibold text-text-primary">
            {editing ? "固定収支を更新" : "固定収支を登録"}
          </h2>
          <p className="text-sm text-text-secondary">
            毎月の発生日・期間をまとめて管理し、予定と実績を揃えます。
          </p>
        </div>
        <span className="material-icons text-primary text-3xl">auto_awesome</span>
      </div>

      {error ? (
        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label="タイトル"
            placeholder="例: 家賃 / サブスク"
            value={values.title}
            onChange={(event) => handleChange("title", event.target.value)}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-secondary">
              種別
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["expense", "income"] as const).map((kind) => {
                const active = values.kind === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => handleChange("kind", kind)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-base">
                        {kind === "income" ? "trending_up" : "trending_down"}
                      </span>
                      {kind === "income" ? "収入" : "支出"}
                    </div>
                    {active ? <span className="material-icons text-sm">check</span> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="金額"
            type="number"
            min={0}
            value={values.amount}
            onChange={(event) => handleChange("amount", event.target.value)}
            placeholder="例: 120000"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-secondary">
              カテゴリ
            </label>
            <select
              value={values.categoryId}
              onChange={(event) =>
                handleChange("categoryId", event.target.value ? Number(event.target.value) : "")
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
            >
              <option value="">選択してください</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="毎月の発生日"
              type="number"
              min={1}
              max={31}
              value={values.dayOfMonth}
              onChange={(event) => handleChange("dayOfMonth", event.target.value)}
            />

            <label className="flex h-full items-center justify-between rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-text-secondary">
              <div>
                <p className="font-medium text-text-primary">月末に丸める</p>
                <p className="text-xs text-text-secondary">29日以降の月は末日に調整</p>
              </div>
              <input
                type="checkbox"
                checked={values.useEndOfMonth}
                onChange={(event) => handleChange("useEndOfMonth", event.target.checked)}
                className="h-5 w-5 rounded-md border border-border text-primary focus:ring-primary"
              />
            </label>
          </div>

          <Input
            label="開始月"
            type="month"
            value={values.effectiveFromMonth}
            onChange={(event) => handleChange("effectiveFromMonth", event.target.value)}
          />

          <Input
            label="終了月（任意）"
            type="month"
            value={values.effectiveToMonth}
            onChange={(event) => handleChange("effectiveToMonth", event.target.value)}
          />

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-text-secondary">
              メモ（任意）
            </label>
            <textarea
              value={values.memo}
              onChange={(event) => handleChange("memo", event.target.value)}
              placeholder="補足やメモを追加"
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" size="md" isLoading={processing}>
            {editing ? "更新して同期" : "登録して全期間に反映"}
          </Button>
          {editing ? (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={onCancelEdit}
              disabled={processing}
            >
              編集をキャンセル
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
};

export default FixedRecurringForm;
