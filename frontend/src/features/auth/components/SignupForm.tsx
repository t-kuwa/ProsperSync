import type { ChangeEvent, FormEventHandler } from "react";
import StatusMessage from "./StatusMessage";
import type { SignupFormValues, Status } from "../types";
import { FormCheckbox, FormField, FormSubmitButton } from "./FormControls";

type SignupFieldKey =
  | "familyName"
  | "givenName"
  | "email"
  | "password"
  | "passwordConfirmation";

type FieldConfig<K extends SignupFieldKey> = {
  name: K;
  label: string;
  placeholder: string;
  autoComplete: string;
  type?: string;
  minLength?: number;
};

const personalFields = [
  {
    name: "familyName",
    label: "姓",
    placeholder: "山田",
    autoComplete: "family-name",
  },
  {
    name: "givenName",
    label: "名",
    placeholder: "太郎",
    autoComplete: "given-name",
  },
] as const satisfies FieldConfig<"familyName" | "givenName">[];

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
    <div className="grid gap-6 md:grid-cols-2">
      {personalFields.map(({ name, label, placeholder, autoComplete }) => (
        <FormField
          key={name}
          label={label}
          name={name}
          value={values[name]}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
        />
      ))}
    </div>

    <FormField
      label="メールアドレス"
      type="email"
      name="email"
      value={values.email}
      onChange={onChange}
      autoComplete="email"
      placeholder="example@company.com"
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
          required
        />
      ))}
    </div>

    <FormCheckbox
      name="acceptTerms"
      checked={values.acceptTerms}
      onChange={onChange}
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
