import type { FormEvent } from "react";

export type AccountFormValues = {
  name: string;
  description: string;
};

type AccountFormProps = {
  values: AccountFormValues;
  onChange: <Field extends keyof AccountFormValues>(
    field: Field,
    value: AccountFormValues[Field],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  submitLabel: string;
  descriptionHelp?: string;
  error?: string | null;
  footer?: React.ReactNode;
};

const AccountForm = ({
  values,
  onChange,
  onSubmit,
  loading = false,
  submitLabel,
  descriptionHelp,
  error,
  footer,
}: AccountFormProps) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit(event);
    }}
    className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
  >
    <div>
      <h2 className="text-lg font-semibold text-slate-900">
        アカウント情報
      </h2>
      <p className="text-sm text-slate-500">
        チームで利用する名前や説明を設定しましょう。
      </p>
    </div>

    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      アカウント名
      <input
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        name="name"
        value={values.name}
        onChange={(event) => onChange("name", event.target.value)}
        placeholder="例: 開発チーム"
        maxLength={80}
        required
      />
    </label>

    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      説明
      <textarea
        className="min-h-[100px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        name="description"
        value={values.description}
        onChange={(event) => onChange("description", event.target.value)}
        placeholder="チームの目的や運用ポリシーなどを記載できます。"
      />
      {descriptionHelp ? (
        <span className="text-xs font-normal text-slate-400">
          {descriptionHelp}
        </span>
      ) : null}
    </label>

    {error ? (
      <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
        {error}
      </div>
    ) : null}

    <div className="flex flex-col gap-3">
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        {loading ? "処理中..." : submitLabel}
      </button>
      {footer}
    </div>
  </form>
);

export default AccountForm;
