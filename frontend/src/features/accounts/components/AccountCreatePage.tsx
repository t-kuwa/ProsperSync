import { useState } from "react";
import { getErrorMessage } from "../../../api/client";
import { APP_ROUTES } from "../../../routes";
import type { AppRoute } from "../../../routes";
import DashboardShell from "../../dashboard/components/DashboardShell";
import useAccountState from "../hooks/useAccountState";
import AccountForm, { type AccountFormValues } from "./AccountForm";

type AccountCreatePageProps = {
  userName?: string;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const AccountCreatePage = ({
  userName,
  onLogout,
  currentRoute,
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
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="チームアカウントを作成"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {status ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 ring-1 ring-emerald-200">
            {status}
          </div>
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
            <p className="text-xs text-slate-400">
              作成後は自動的にオーナーとして登録されます。
            </p>
          }
        />
      </div>
    </DashboardShell>
  );
};

export default AccountCreatePage;
