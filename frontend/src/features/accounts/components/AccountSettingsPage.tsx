import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import type { AppRoute } from "../../../routes";
import { APP_ROUTES } from "../../../routes";
import DashboardShell from "../../dashboard/components/DashboardShell";
import { getMembers } from "../../../api/accounts";
import useAccountState from "../hooks/useAccountState";
import type { Membership } from "../types";
import GlassPanel from "../../../components/ui/GlassPanel";

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
        <GlassPanel className="text-sm text-slate-600">
          アカウントが選択されていません。サイドバーからワークスペースを選択してください。
        </GlassPanel>
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

          <GlassPanel as="article" className="flex flex-col gap-4">
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
          </GlassPanel>

          <GlassPanel as="section">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">メンバー</h2>
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                {loadingMembers ? "同期中" : `${members.length}名`}
              </span>
            </div>
            {loadingMembers ? (
              <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                メンバーを読み込んでいます…
              </p>
            ) : members.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">まだメンバーがいません。</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {member.user?.name ?? `ユーザー #${member.userId}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {member.user?.email ?? "メール未設定"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        member.role === "owner"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {member.role === "owner" ? "オーナー" : "メンバー"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>

          <GlassPanel as="section" className="text-sm text-slate-600">
            <h2 className="text-lg font-semibold text-slate-900">あなたの役職</h2>
            <p className="mt-2 text-sm text-slate-600">
              {isOwner
                ? "あなたはこのワークスペースのオーナーです。"
                : "あなたはこのワークスペースのメンバーです。アカウント情報を編集できません。"}
            </p>
          </GlassPanel>

          {isOwner && currentAccount.accountType === "team" ? (
            <GlassPanel as="section" tone="danger" className="text-sm">
              <h2 className="text-lg font-semibold text-rose-700">危険な操作</h2>
              <p className="mt-2 text-sm">
                このワークスペースを削除すると、すべてのメンバーと取引データが完全に失われます。
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="mt-4 inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {deleting ? "削除中..." : "チームを削除"}
              </button>
            </GlassPanel>
          ) : null}
        </div>
      )}
    </DashboardShell>
  );
};

export default AccountSettingsPage;
