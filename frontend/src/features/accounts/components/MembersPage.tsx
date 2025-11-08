import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../../../api/accounts";
import type { AppRoute } from "../../../routes";
import DashboardShell from "../../dashboard/components/DashboardShell";
import useAccountState from "../hooks/useAccountState";
import type { Membership, MembershipRole } from "../types";
import AddMemberModal from "./AddMemberModal";

type MembersPageProps = {
  userName?: string;
  currentUserId: number;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

type MemberFormState = {
  userId: string;
  role: MembershipRole;
};

const initialFormState: MemberFormState = {
  userId: "",
  role: "member",
};

const MembersPage = ({
  userName,
  currentUserId,
  onLogout,
  currentRoute,
  onNavigate,
}: MembersPageProps) => {
  const { currentAccount } = useAccountState();
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [formState, setFormState] =
    useState<MemberFormState>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;
    if (!currentAccount) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

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
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentAccount?.id]);

  const ownerCount = useMemo(
    () => members.filter((member) => member.role === "owner").length,
    [members],
  );

  const currentUserMembership = useMemo(
    () =>
      members.find((member) => member.userId === currentUserId) ?? null,
    [members, currentUserId],
  );

  const isOwner = currentUserMembership?.role === "owner";

  const handleCreateMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentAccount) {
      return;
    }

    const userIdValue = formState.userId.trim();
    if (!userIdValue) {
      setFormError("ユーザーIDを入力してください。");
      return;
    }

    const userId = Number.parseInt(userIdValue, 10);
    if (Number.isNaN(userId)) {
      setFormError("ユーザーIDは数値で入力してください。");
      return;
    }

    setCreating(true);
    setFormError(null);
    setStatus(null);

    try {
      const member = await createMember(currentAccount.id, {
        userId,
        role: formState.role,
      });
      setMembers((prev) => [...prev, member]);
      setFormState(initialFormState);
      setStatus("メンバーを追加しました。");
      setIsModalOpen(false);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (
    member: Membership,
    role: MembershipRole,
  ) => {
    if (!currentAccount) {
      return;
    }

    setUpdatingMemberId(member.id);
    setStatus(null);

    try {
      const updated = await updateMember(currentAccount.id, member.id, {
        role,
      });
      setMembers((prev) =>
        prev.map((item) => (item.id === member.id ? updated : item)),
      );
      setStatus("メンバーのロールを更新しました。");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveMember = async (member: Membership) => {
    if (!currentAccount) {
      return;
    }

    setRemovingMemberId(member.id);
    setStatus(null);

    try {
      await deleteMember(currentAccount.id, member.id);
      setMembers((prev) => prev.filter((item) => item.id !== member.id));
      setStatus("メンバーを削除しました。");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRemovingMemberId(null);
    }
  };

  const headerActions = currentAccount ? (
    <div className="rounded-xl bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
      <span className="font-semibold text-slate-900">
        {currentAccount.name}
      </span>
      <span className="ml-2 text-xs text-slate-400">
        メンバー数: {members.length}
      </span>
    </div>
  ) : null;

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="メンバー管理"
      headerSubtitle="ワークスペースのメンバーを追加・編集・削除できます。"
      headerActions={headerActions}
    >
      {!currentAccount ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          アカウントが選択されていません。サイドバーからワークスペースを選択してください。
        </div>
      ) : (
        <>
          <div className="flex w-full flex-col gap-4">
            {status ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 ring-1 ring-emerald-200">
                {status}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 ring-1 ring-rose-200">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
                メンバーを読み込み中です...
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
                登録されているメンバーはいません。
              </div>
            ) : (
              <div className="w-full rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">メンバー</h2>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-300 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-400"
                    >
                      <span className="material-icons text-lg">add</span>
                    </button>
                  )}
                </header>
                <div className="overflow-x-scroll">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          アイコン
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          名前
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          メールアドレス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          ロール
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          参加日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          最終ログイン日
                        </th>
                        <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {members.map((member) => {
                        const isSelf = member.userId === currentUserId;
                        const isOwnerMember = member.role === "owner";
                        const canEditRole =
                          isOwner &&
                          (!isOwnerMember ||
                            ownerCount > 1 ||
                            member.userId !== currentUserId);
                        const canRemove =
                          (isOwner && member.userId !== currentUserId) ||
                          (!isOwner && isSelf);
                        const canRemoveFinal =
                          canRemove &&
                          !(isOwnerMember && member.userId === currentUserId);
                        const memberName =
                          member.user?.name ?? `ユーザー#${member.userId}`;
                        const memberEmail =
                          member.user?.email ?? "メールアドレス未取得";
                        const initials = memberName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "?";
                        const joinedDate = member.joinedAt
                          ? new Date(member.joinedAt).toLocaleString("ja-JP")
                          : "未設定";
                        const lastLoginDate = joinedDate;

                        return (
                          <tr
                            key={member.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                                {initials}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                              {memberName}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                              {memberEmail}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  member.role === "owner"
                                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                                    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                                }`}
                              >
                                {member.role === "owner" ? "オーナー" : "メンバー"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                              {joinedDate}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                              {lastLoginDate}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-2">
                                {canEditRole && (
                                  <select
                                    value={member.role}
                                    disabled={
                                      updatingMemberId === member.id ||
                                      removingMemberId === member.id
                                    }
                                    onChange={(event) => {
                                      void handleRoleChange(
                                        member,
                                        event.target.value as MembershipRole,
                                      );
                                    }}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                  >
                                    <option value="member">メンバー</option>
                                    <option value="owner">オーナー</option>
                                  </select>
                                )}
                                {canRemoveFinal && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      void handleRemoveMember(member);
                                    }}
                                    disabled={
                                      updatingMemberId === member.id ||
                                      removingMemberId === member.id
                                    }
                                    className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                                  >
                                    {removingMemberId === member.id
                                      ? "削除中..."
                                      : "削除"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <AddMemberModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setFormState(initialFormState);
              setFormError(null);
            }}
            onSubmit={handleCreateMember}
            userId={formState.userId}
            role={formState.role}
            onUserIdChange={(value) =>
              setFormState((prev) => ({ ...prev, userId: value }))
            }
            onRoleChange={(role) =>
              setFormState((prev) => ({ ...prev, role }))
            }
            isOwner={isOwner}
            creating={creating}
            error={formError}
          />
        </>
      )}
    </DashboardShell>
  );
};

export default MembersPage;
