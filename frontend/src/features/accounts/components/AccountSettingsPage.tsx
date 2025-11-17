import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import type { AppRoute } from "../../../routes";
import { APP_ROUTES } from "../../../routes";
import DashboardShell from "../../dashboard/components/DashboardShell";
import { getMembers } from "../../../api/accounts";
import useAccountState from "../hooks/useAccountState";
import type { Membership } from "../types";

type AccountFormValues = {
  name: string;
  description: string;
};

type AccountSettingsPageProps = {
  userName?: string;
  currentUserId: number;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const AccountSettingsPage = ({
  userName,
  currentUserId,
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
  const [members, setMembers] = useState<Membership[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<AccountFormValues>({
    name: "",
    description: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;
    if (!currentAccount) {
      setMembers([]);
      setLoadingMembers(false);
      return;
    }

    setLoadingMembers(true);
    getMembers(currentAccount.id)
      .then((data) => {
        if (!isActive) {
          return;
        }
        setMembers(data);
      })
      .catch((err) => {
        if (!isActive) {
          return;
        }
        console.error("Failed to fetch members:", err);
      })
      .finally(() => {
        if (isActive) {
          setLoadingMembers(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentAccount?.id]);

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
  }, [currentAccount?.id, isEditing]);

  const currentUserMembership = useMemo(
    () =>
      members.find((member) => member.userId === currentUserId) ?? null,
    [members, currentUserId],
  );

  const isOwner = currentUserMembership?.role === "owner";

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
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCancelEdit = () => {
    if (!currentAccount) {
      return;
    }

    setFormValues({
      name: currentAccount.name,
      description: currentAccount.description ?? "",
    });
    setIsEditing(false);
    setError(null);
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

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="アカウント設定"
    >
      {!currentAccount ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          アカウントが選択されていません。サイドバーからワークスペースを選択してください。
        </div>
      ) : (
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
          {error ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 ring-1 ring-rose-200">
              {error}
            </div>
          ) : null}

          <article className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <header className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={formValues.name}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg font-semibold text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    placeholder="アカウント名"
                    maxLength={80}
                    required
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-slate-900">
                    {currentAccount.name}
                  </h2>
                )}
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">
                {currentAccount.accountType === "personal"
                  ? "個人アカウント"
                  : "チームアカウント"}
              </span>
            </header>

            <dl className="grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  説明
                </dt>
                <dd className="mt-1 text-slate-700">
                  {isEditing ? (
                    <textarea
                      value={formValues.description}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      placeholder="説明を入力してください"
                    />
                  ) : (
                    currentAccount.description || "説明は設定されていません。"
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  オーナー
                </dt>
                <dd className="mt-1 text-slate-700">
                  {currentAccount.owner
                    ? `${currentAccount.owner.name}（${currentAccount.owner.email}）`
                    : "不明"}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  作成日
                </dt>
                <dd className="mt-1 text-slate-700">
                  {new Date(currentAccount.createdAt).toLocaleString("ja-JP")}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">
                  最終更新日
                </dt>
                <dd className="mt-1 text-slate-700">
                  {new Date(currentAccount.updatedAt).toLocaleString("ja-JP")}
                </dd>
              </div>
            </dl>

            {isOwner && (
              <div className="flex gap-3 pt-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={processing}
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                      {processing ? "処理中..." : "保存"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={processing}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                  >
                    編集
                  </button>
                )}
              </div>
            )}
          </article>

          <section className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">あなたの役職</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isOwner
                ? "あなたはこのワークスペースのオーナーです。"
                : "あなたはこのワークスペースのメンバーです。アカウント情報を編集できません。"}
            </p>
          </section>
        </div>
      )}
    </DashboardShell>
  );
};

export default AccountSettingsPage;
