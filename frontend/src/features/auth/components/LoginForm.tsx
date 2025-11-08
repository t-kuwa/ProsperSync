import type { ChangeEvent, FormEventHandler } from "react";
import StatusMessage from "./StatusMessage";
import type { LoginFormValues, Status } from "../types";
import {
  FormCheckbox,
  FormField,
  FormSubmitButton,
} from "./FormControls";

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
    <FormField
      label="メールアドレス"
      type="email"
      name="email"
      value={values.email}
      onChange={onChange}
      autoComplete="email"
      placeholder="example@company.com"
      disabled={loading}
      required
    />

    <FormField
      label="パスワード"
      type="password"
      name="password"
      value={values.password}
      onChange={onChange}
      autoComplete="current-password"
      placeholder="••••••••"
      disabled={loading}
      required
    />

    <div className="flex items-center justify-between text-xs text-slate-600">
      <FormCheckbox
        name="rememberLogin"
        containerClassName="flex items-center gap-2"
        className="mt-0"
        label="ログイン情報を保存"
        disabled={loading}
      />
      <button type="button" className="hidden font-semibold text-indigo-300 hover:text-indigo-200">
        パスワードをお忘れですか？
      </button>
    </div>

    <FormSubmitButton
      loading={loading}
      loadingLabel="サインイン中..."
      idleLabel="サインイン"
    />

    {status && <StatusMessage status={status} />}
  </form>
);

export default LoginForm;
