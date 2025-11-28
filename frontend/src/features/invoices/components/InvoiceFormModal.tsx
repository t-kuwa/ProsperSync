import { useMemo, useState } from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type { AccountSummary } from "../../accounts/types";
import type { InvoicePayload } from "../types";
import formatCurrency from "../../dashboard/utils/formatCurrency";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: InvoicePayload) => Promise<void>;
  accounts: AccountSummary[];
  currentAccountId: number | null;
  processing: boolean;
};

type LocalLine = {
  description: string;
  quantity: string;
  unitPrice: string;
};

const emptyLine = (): LocalLine => ({
  description: "",
  quantity: "1",
  unitPrice: "",
});

const InvoiceFormModal = ({
  open,
  onClose,
  onSubmit,
  accounts,
  currentAccountId,
  processing,
}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [payerAccountId, setPayerAccountId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState<LocalLine[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () =>
      lines.reduce(
        (sum, line) => {
          const qty = Number(line.quantity);
          const price = Number(line.unitPrice);
          if (Number.isFinite(qty) && Number.isFinite(price)) {
            return sum + qty * price;
          }
          return sum;
        },
        0,
      ),
    [lines],
  );

  if (!open) return null;

  const handleAddLine = () => setLines((prev) => [...prev, emptyLine()]);

  const handleLineChange = (index: number, key: keyof LocalLine, value: string) => {
    setLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              [key]: value,
            }
          : line,
      ),
    );
  };

  const handleLineRemove = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!payerAccountId) {
      setError("支払先ワークスペースを選択してください");
      return;
    }
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    const cleanedLines = lines
      .map((line, idx) => {
        const quantity = Number(line.quantity);
        const unitPriceMinor = Number(line.unitPrice);
        return {
          description: line.description.trim(),
          quantity,
          unitPriceMinor,
          position: idx,
        };
      })
      .filter(
        (line) =>
          line.description &&
          Number.isFinite(line.quantity) &&
          line.quantity > 0 &&
          Number.isFinite(line.unitPriceMinor) &&
          line.unitPriceMinor > 0,
      );
    if (!cleanedLines.length) {
      setError("明細を1件以上入力してください");
      return;
    }

    setError(null);
    await onSubmit({
      payerAccountId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      memo: memo || undefined,
      currency: "JPY",
      lines: cleanedLines,
    });
    onClose();
    setTitle("");
    setDescription("");
    setPayerAccountId(null);
    setDueDate("");
    setMemo("");
    setLines([emptyLine()]);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card className="relative z-10 w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-text-secondary">請求書作成</p>
            <h3 className="text-lg font-semibold text-text-primary">新しい請求書を作成</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {error ? (
          <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 家計折半 11月"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                支払先ワークスペース
              </label>
              <select
                value={payerAccountId ?? ""}
                onChange={(e) => setPayerAccountId(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
              >
                <option value="">選択してください</option>
                {accounts
                  .filter((a) => a.id !== currentAccountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.accountType === "personal" ? "個人" : "チーム"})
                    </option>
                  ))}
              </select>
            </div>
            <Input
              label="期日"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Input
              label="説明（任意）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: 食費・電気代の折半分"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">明細</label>
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto] items-end rounded-2xl border border-border px-3 py-3 bg-background"
                >
                  <Input
                    label="内容"
                    value={line.description}
                    onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                    placeholder="例: 食費折半"
                  />
                  <Input
                    label="数量"
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => handleLineChange(idx, "quantity", e.target.value)}
                  />
                  <Input
                    label="単価（最小単位）"
                    type="number"
                    min={1}
                    value={line.unitPrice}
                    onChange={(e) => handleLineChange(idx, "unitPrice", e.target.value)}
                  />
                  <div className="flex justify-end md:justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLineRemove(idx)}
                      className="h-10"
                    >
                      <span className="material-icons text-base mr-1">delete</span>
                      削除
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                <span className="material-icons text-base mr-1">add</span>
                明細を追加
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">メモ（任意）</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-text-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              合計:{" "}
              <span className="font-semibold text-text-primary">
                {formatCurrency(total)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} size="sm">
                キャンセル
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={processing}>
                下書きを保存
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default InvoiceFormModal;
