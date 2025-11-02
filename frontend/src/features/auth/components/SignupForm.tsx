import type { ChangeEvent, FormEventHandler } from "react";
import StatusMessage from "./StatusMessage";
import type { SignupFormValues, Status } from "../types";

type SignupFormProps = {
  values: SignupFormValues;
  loading: boolean;
  status: Status | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export const SignupForm = ({
  values,
  loading,
  status,
  onChange,
  onSubmit,
}: SignupFormProps) => (
  <form onSubmit={onSubmit} className="mt-8 space-y-6">
    <div className="grid gap-6 md:grid-cols-2">
      <label className="flex flex-col text-sm text-slate-300">
        <span className="mb-2 font-medium">姓</span>
        <input
          type="text"
          name="firstName"
          value={values.firstName}
          onChange={onChange}
          autoComplete="given-name"
          className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
          placeholder="山田"
          required
        />
      </label>
      <label className="flex flex-col text-sm text-slate-300">
        <span className="mb-2 font-medium">名</span>
        <input
          type="text"
          name="lastName"
          value={values.lastName}
          onChange={onChange}
          autoComplete="family-name"
          className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
          placeholder="太郎"
          required
        />
      </label>
    </div>

    <label className="flex flex-col text-sm text-slate-300">
      <span className="mb-2 font-medium">メールアドレス</span>
      <input
        type="email"
        name="email"
        value={values.email}
        onChange={onChange}
        autoComplete="email"
        className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
        placeholder="example@company.com"
        required
      />
    </label>

    <div className="grid gap-6 md:grid-cols-2">
      <label className="flex flex-col text-sm text-slate-300">
        <span className="mb-2 font-medium">パスワード</span>
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={onChange}
          autoComplete="new-password"
          className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
          placeholder="••••••••"
          minLength={6}
          required
        />
      </label>
      <label className="flex flex-col text-sm text-slate-300">
        <span className="mb-2 font-medium">パスワード（確認）</span>
        <input
          type="password"
          name="passwordConfirmation"
          value={values.passwordConfirmation}
          onChange={onChange}
          autoComplete="new-password"
          className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
          placeholder="••••••••"
          minLength={6}
          required
        />
      </label>
    </div>

    <label className="flex items-start gap-3 text-xs text-slate-400">
      <input
        type="checkbox"
        name="acceptTerms"
        checked={values.acceptTerms}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
      />
      <span>
        <span className="font-medium text-slate-200">利用規約</span>と
        <span className="font-medium text-slate-200">プライバシーポリシー</span>に同意します。
      </span>
    </label>

    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/50"
    >
      {loading ? "作成中..." : "アカウントを作成"}
    </button>

    <div className="grid gap-3 md:grid-cols-2">
      <button
        type="button"
        className="flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/70"
      >
        <span role="img" aria-label="google" className="text-lg">
          🔍
        </span>
        Googleで登録
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/70"
      >
        <span role="img" aria-label="apple" className="text-lg">
          🍎
        </span>
        Appleで登録
      </button>
    </div>

    {status && <StatusMessage status={status} />}
  </form>
);

export default SignupForm;
