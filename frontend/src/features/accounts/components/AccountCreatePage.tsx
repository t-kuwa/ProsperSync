import { useState } from "react";
import { getErrorMessage } from "../../../api/client";
import { APP_ROUTES } from "../../../routes";
import type { AppRoute } from "../../../routes";
import useAccountState from "../hooks/useAccountState";
import AccountForm, { type AccountFormValues } from "./AccountForm";
import { Card } from "../../../components/ui/Card";

type AccountCreatePageProps = {
  onNavigate: (route: AppRoute) => void;
};

const AccountCreatePage = ({
  onNavigate,
}: AccountCreatePageProps) => {
  const { createTeamAccount, processing } = useAccountState();
  const [values, setValues] = useState<AccountFormValues>({
    name: "",
    description: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setStatus(null);
    setError(null);

    try {
      const account = await createTeamAccount({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      });
      setStatus("新しいチームアカウントを作成しました。");
      setValues({ name: "", description: "" });
      onNavigate(APP_ROUTES.accountSettings(account.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-left">
        <h1 className="text-2xl font-bold text-text-primary">チームアカウントを作成</h1>
        <p className="mt-1 text-sm text-text-secondary">
          新しいチームアカウントを作成して、メンバーと家計簿を共有しましょう。
        </p>
      </div>

      {status ? (
        <Card className="bg-green-50 border-green-100 p-4 text-sm text-green-600">
          {status}
        </Card>
      ) : null}

      <AccountForm
        values={values}
        onChange={(field, value) => {
          setValues((prev) => ({
            ...prev,
            [field]: value,
          }));
        }}
        onSubmit={handleSubmit}
        loading={processing}
        submitLabel="アカウントを作成"
        descriptionHelp="作成後に設定ページから詳細を編集できます。"
        error={error}
        footer={
          <p className="text-xs text-text-secondary">
            作成後は自動的にオーナーとして登録されます。
          </p>
        }
      />
    </div>
  );
};

export default AccountCreatePage;
