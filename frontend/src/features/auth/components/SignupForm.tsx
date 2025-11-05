import type { ChangeEvent, FormEventHandler } from "react";
import StatusMessage from "./StatusMessage";
import type { SignupFormValues, Status } from "../types";
import { FormCheckbox, FormField, FormSubmitButton } from "./FormControls";

type SignupFieldKey = | "name" | "email" | "password" | "passwordConfirmation";

type FieldConfig<K extends SignupFieldKey> = {
  name: K;
  label: string;
  placeholder: string;
  autoComplete: string;
  type?: string;
  minLength?: number;
};

const passwordFields = [
  {
    name: "password",
    label: "パスワード",
    placeholder: "••••••••",
    autoComplete: "new-password",
    type: "password",
    minLength: 6,
  },
  {
    name: "passwordConfirmation",
    label: "パスワード（確認）",
    placeholder: "••••••••",
    autoComplete: "new-password",
    type: "password",
    minLength: 6,
  },
] as const satisfies FieldConfig<
  "password" | "passwordConfirmation"
>[];

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
    <FormField
      label="名前"
      name="name"
      value={values.name}
      onChange={onChange}
      autoComplete="name"
      placeholder="山田 太郎"
      disabled={loading}
      required
    />

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

    <div className="grid gap-6 md:grid-cols-2">
      {passwordFields.map(({
        name,
        label,
        placeholder,
        autoComplete,
        type,
        minLength,
      }) => (
        <FormField
          key={name}
          label={label}
          type={type}
          name={name}
          value={values[name]}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          disabled={loading}
          required
        />
      ))}
    </div>

    <FormCheckbox
      name="acceptTerms"
      checked={values.acceptTerms}
      onChange={onChange}
      disabled={loading}
      label={(
        <>
          <span className="font-medium text-slate-200">利用規約</span>と
          <span className="font-medium text-slate-200">プライバシーポリシー</span>に同意します。
        </>
      )}
    />

    <FormSubmitButton
      loading={loading}
      loadingLabel="作成中..."
      idleLabel="アカウントを作成"
    />

    {status && <StatusMessage status={status} />}
  </form>
);

export default SignupForm;
