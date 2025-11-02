import type { ChangeEvent, FormEventHandler } from "react";
import StatusMessage from "./StatusMessage";
import type { LoginFormValues, Status } from "../types";

type LoginFormProps = {
  values: LoginFormValues;
  loading: boolean;
  status: Status | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export const LoginForm = ({
  values,
  loading,
  status,
  onChange,
  onSubmit,
}: LoginFormProps) => (
  <form onSubmit={onSubmit} className="mt-8 space-y-6">
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

    <label className="flex flex-col text-sm text-slate-300">
      <span className="mb-2 font-medium">パスワード</span>
      <input
        type="password"
        name="password"
        value={values.password}
        onChange={onChange}
        autoComplete="current-password"
        className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-base text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
        placeholder="••••••••"
        required
      />
    </label>

    <div className="flex items-center justify-between text-xs text-slate-400">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
        />
        ログイン情報を保存
      </label>
      <button type="button" className="font-semibold text-indigo-300 hover:text-indigo-200">
        パスワードをお忘れですか？
      </button>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-500/50"
    >
      {loading ? "サインイン中..." : "サインイン"}
    </button>

    {status && <StatusMessage status={status} />}
  </form>
);

export default LoginForm;
