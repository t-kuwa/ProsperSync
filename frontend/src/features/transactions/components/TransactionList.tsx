import formatCurrency from "../../dashboard/utils/formatCurrency";
import type {
  Category,
  PaginationState,
  Transaction,
  TransactionFilters,
  TransactionSort,
  TransactionSortField,
} from "../types";

type FilterChangeHandler = <Key extends keyof TransactionFilters>(
  key: Key,
  value: TransactionFilters[Key],
) => void;

type TransactionListProps = {
  transactions: Transaction[];
  totals: { income: number; expense: number };
  loading: boolean;
  processing: boolean;
  error: string | null;
  filters: TransactionFilters;
  sort: TransactionSort;
  pagination: PaginationState;
  totalPages: number;
  categories: Category[];
  onFilterChange: FilterChangeHandler;
  onResetFilters: () => void;
  onSortChange: (field: TransactionSortField) => void;
  onPageChange: (page: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

const Chip = ({
  active,
  label,
  onClick,
  color,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  color: "slate" | "emerald" | "rose";
}) => {
  const activeClasses: Record<typeof color, string> = {
    slate: "bg-slate-900 text-white",
    emerald: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    rose: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? activeClasses[color]
          : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
};

const TransactionList = ({
  transactions,
  totals,
  loading,
  processing,
  error,
  filters,
  sort,
  pagination,
  totalPages,
  categories,
  onFilterChange,
  onResetFilters,
  onSortChange,
  onPageChange,
  onEdit,
  onDelete,
}: TransactionListProps) => {
  const renderSortBadge = (field: TransactionSortField) => {
    if (sort.field !== field) {
      return null;
    }

    return (
      <span className="ml-1 text-[10px] font-semibold text-indigo-500">
        {sort.direction === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const handleDelete = (transaction: Transaction) => {
    const confirmed = window.confirm(
      `${transaction.title} を削除しますか？この操作は取り消せません。`,
    );

    if (confirmed) {
      onDelete(transaction);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">取引履歴</h2>
          <p className="text-sm text-slate-500">
            フィルタや並び替えを活用してトランザクションを探しましょう。
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            総収入 {formatCurrency(totals.income)}
          </span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-600">
            総支出 {formatCurrency(totals.expense)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-2xl bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            label="すべて"
            color="slate"
            active={filters.type === "all"}
            onClick={() => onFilterChange("type", "all")}
          />
          <Chip
            label="収入"
            color="emerald"
            active={filters.type === "income"}
            onClick={() => onFilterChange("type", "income")}
          />
          <Chip
            label="支出"
            color="rose"
            active={filters.type === "expense"}
            onClick={() => onFilterChange("type", "expense")}
          />
          <div className="ml-auto flex items-center gap-2">
            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                onFilterChange("search", event.target.value)
              }
              placeholder="キーワード検索"
              className="w-48 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
            />
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-slate-500 underline-offset-4 hover:underline"
            >
              条件をリセット
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              カテゴリ
            </label>
            <select
              value={filters.categoryId ?? ""}
              onChange={(event) =>
                onFilterChange(
                  "categoryId",
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">すべて</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              開始日
            </label>
            <input
              type="date"
              value={filters.startDate ?? ""}
              onChange={(event) => {
                onFilterChange("startDate", event.target.value || null);
                if (event.target.value) {
                  onFilterChange("month", null);
                }
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              終了日
            </label>
            <input
              type="date"
              value={filters.endDate ?? ""}
              onChange={(event) => {
                onFilterChange("endDate", event.target.value || null);
                if (event.target.value) {
                  onFilterChange("month", null);
                }
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              月で絞り込み
            </label>
            <input
              type="month"
              value={filters.month ?? ""}
              onChange={(event) => {
                onFilterChange("month", event.target.value || null);
                if (event.target.value) {
                  onFilterChange("startDate", null);
                  onFilterChange("endDate", null);
                }
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              {([
                { field: "date", label: "日付" },
                { field: "category", label: "カテゴリ" },
                { field: "amount", label: "金額" },
              ] as const).map((column) => (
                <th
                  key={column.field}
                  className="cursor-pointer px-3 py-2"
                  onClick={() => onSortChange(column.field)}
                >
                  <span className="inline-flex items-center">
                    {column.label}
                    {renderSortBadge(column.field)}
                  </span>
                </th>
              ))}
              <th className="px-3 py-2">詳細</th>
              <th className="px-3 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  データを取得しています...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-slate-400"
                >
                  条件に一致する取引がありません。
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr
                  key={transaction.uid}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-3 py-3 text-sm text-slate-500">
                    {transaction.date}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            transaction.category.color ?? "#cbd5f5",
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {transaction.category.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {transaction.title}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        transaction.resourceType === "income"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {transaction.resourceType === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount).replace("￥", "")}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-500">
                    {transaction.memo ?? "メモなし"}
                  </td>
                  <td className="px-3 py-3 text-center text-xs font-semibold text-indigo-600">
                    <button
                      type="button"
                      className="rounded-full px-3 py-1 hover:bg-indigo-50"
                      onClick={() => onEdit(transaction)}
                      disabled={processing}
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      className="ml-2 rounded-full px-3 py-1 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(transaction)}
                      disabled={processing}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>
          ページ {pagination.page} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            前へ
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
            disabled={pagination.page >= totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
