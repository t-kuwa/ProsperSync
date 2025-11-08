import { useEffect, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import type { AppRoute } from "../../../routes";
import { APP_ROUTES } from "../../../routes";
import DashboardShell from "../../dashboard/components/DashboardShell";
import useAccountState from "../hooks/useAccountState";
import AccountCard from "./AccountCard";
import AccountForm, { type AccountFormValues } from "./AccountForm";

type AccountSettingsPageProps = {
  userName?: string;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const AccountSettingsPage = ({
  userName,
  onLogout,
  currentRoute,
  onNavigate,
}: AccountSettingsPageProps) => {
  const {
    currentAccount,
    processing,
    updateAccountDetails,
    deleteAccountById,
  } = useAccountState();
  const [formValues, setFormValues] = useState<AccountFormValues>({
    name: "",
    description: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!currentAccount) {
      return;
    }

    setFormValues({
      name: currentAccount.name,
      description: currentAccount.description ?? "",
    });
    setStatus(null);
    setError(null);
  }, [currentAccount?.id]);

  const handleSubmit = async () => {
    if (!currentAccount) {
      return;
    }

    setStatus(null);
    setError(null);

    try {
      await updateAccountDetails(currentAccount.id, {
        name: formValues.name.trim(),
        description: formValues.description.trim() || null,
      });
      setStatus("アカウント情報を更新しました。");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!currentAccount || currentAccount.accountType === "personal") {
      return;
    }

    const confirmed = window.confirm(
      "このチームアカウントを削除しますか？すべてのメンバーシップ情報が削除されます。",
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccountById(currentAccount.id);
      setStatus("アカウントを削除しました。");
      onNavigate(APP_ROUTES.dashboard);
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const headerSubtitle = currentAccount
    ? `${currentAccount.name} の設定を管理します。`
    : "アカウント情報を管理します。";

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="アカウント設定"
      headerSubtitle={headerSubtitle}
    >
      {!currentAccount ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          アカウントが選択されていません。サイドバーからワークスペースを選択してください。
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <AccountForm
            values={formValues}
            onChange={(field, value) => {
              setFormValues((prev) => ({
                ...prev,
                [field]: value,
              }));
            }}
            onSubmit={handleSubmit}
            loading={processing}
            submitLabel="アカウントを更新"
            error={error}
            footer={
              currentAccount.accountType === "team" ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleDelete();
                  }}
                  disabled={deleting}
                  className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  {deleting ? "削除中..." : "チームアカウントを削除"}
                </button>
              ) : (
                <p className="text-xs text-slate-400">
                  個人アカウントは削除できません。
                </p>
              )
            }
          />

          <div className="flex flex-col gap-4">
            {status ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 ring-1 ring-emerald-200">
                {status}
              </div>
            ) : null}
            {deleteError ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 ring-1 ring-rose-200">
                {deleteError}
              </div>
            ) : null}
            <AccountCard account={currentAccount} />
            <section className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                アカウントタイプ
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {currentAccount.accountType === "personal"
                  ? "このワークスペースは個人用です。他のメンバーは追加できません。"
                  : "このワークスペースはチーム用です。メンバー管理ページから招待できます。"}
              </p>
            </section>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default AccountSettingsPage;
