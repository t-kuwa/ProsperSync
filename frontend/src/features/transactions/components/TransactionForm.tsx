import type {
  EntryFormState,
  FormChangeHandler,
} from "../../dashboard/hooks/useDashboardState";

type TransactionFormProps = {
  entryForm: EntryFormState;
  onChange: FormChangeHandler<EntryFormState>;
  onSubmit: () => void;
};

const TransactionForm = ({
  entryForm,
  onChange,
  onSubmit,
}: TransactionFormProps) => (
  <div className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <h2 className="text-lg font-semibold text-slate-900">新しい取引を登録</h2>
    <p className="mt-1 text-sm text-slate-500">
      収入または支出を記録し、キャッシュフローを常に最新に保ちましょう。
    </p>

    <form
      className="mt-6 grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1 text-sm font-medium text-slate-600">
        <button
          type="button"
          className={`flex-1 rounded-lg px-3 py-2 transition ${
            entryForm.type === "income"
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200"
              : "hover:text-indigo-600"
          }`}
          onClick={() => onChange("type", "income")}
        >
          収入
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg px-3 py-2 transition ${
            entryForm.type === "expense"
              ? "bg-white text-rose-600 shadow-sm ring-1 ring-rose-200"
              : "hover:text-rose-600"
          }`}
          onClick={() => onChange("type", "expense")}
        >
          支出
        </button>
      </div>

      <input
        value={entryForm.category}
        onChange={(event) => onChange("category", event.target.value)}
        placeholder="タイトル（例: 食費）"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          value={entryForm.amount}
          onChange={(event) => onChange("amount", event.target.value)}
          placeholder="金額（円）"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          required
          inputMode="numeric"
        />
        <input
          type="date"
          value={entryForm.date}
          onChange={(event) => onChange("date", event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          required
        />
      </div>

      <textarea
        value={entryForm.note}
        onChange={(event) => onChange("note", event.target.value)}
        placeholder="メモ（任意）"
        rows={3}
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />

      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        取引を登録
      </button>
    </form>
  </div>
);

export default TransactionForm;
