import type { FormEvent } from "react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

export type AccountFormValues = {
  name: string;
  description: string;
  isDefault?: boolean;
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
  <Card className="p-6">
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(event);
      }}
      className="flex flex-col gap-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          アカウント情報
        </h2>
        <p className="text-sm text-text-secondary">
          チームで利用する名前や説明を設定しましょう。
        </p>
      </div>

      <Input
        label="アカウント名"
        name="name"
        value={values.name}
        onChange={(event) => onChange("name", event.target.value)}
        placeholder="例: 開発チーム"
        maxLength={80}
        required
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-secondary">
          説明
        </label>
        <textarea
          className="min-h-[100px] w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary"
          name="description"
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="チームの目的や運用ポリシーなどを記載できます。"
        />
        {descriptionHelp ? (
          <span className="text-xs font-normal text-text-secondary">
            {descriptionHelp}
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          isLoading={loading}
          className="w-full justify-center"
        >
          {submitLabel}
        </Button>
        {footer}
      </div>
    </form>
  </Card>
);

export default AccountForm;
