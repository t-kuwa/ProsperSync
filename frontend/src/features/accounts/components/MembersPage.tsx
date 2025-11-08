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
import AccountCard from "./AccountCard";
import MemberCard from "./MemberCard";

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

  const handleCreateMember = async () => {
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
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <AccountCard account={currentAccount} />

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                メンバーを追加
              </h2>
              <p className="text-sm text-slate-500">
                既存ユーザーのIDを指定して招待します。オーナーのみが追加できます。
              </p>

              {!isOwner ? (
                <div className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-500">
                  メンバーを追加するにはオーナー権限が必要です。
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-4">
                <label className="text-sm font-medium text-slate-700">
                  ユーザーID
                  <input
                    type="number"
                    inputMode="numeric"
                    value={formState.userId}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        userId: event.target.value,
                      }))
                    }
                    disabled={!isOwner || creating}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="例: 42"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  ロール
                  <select
                    value={formState.role}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        role: event.target.value as MembershipRole,
                      }))
                    }
                    disabled={!isOwner || creating}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="member">メンバー</option>
                    <option value="owner">オーナー</option>
                  </select>
                </label>

                {formError ? (
                  <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
                    {formError}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    void handleCreateMember();
                  }}
                  disabled={!isOwner || creating}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {creating ? "追加中..." : "メンバーを追加"}
                </button>
              </div>
            </section>
          </div>

          <section className="flex flex-col gap-4">
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
              members.map((member) => {
                const isSelf = member.userId === currentUserId;
                const isOwnerMember = member.role === "owner";
                const canEditRole =
                  isOwner &&
                  (!isOwnerMember || ownerCount > 1 || member.userId !== currentUserId);
                const canRemove =
                  (isOwner && member.userId !== currentUserId) ||
                  (!isOwner && isSelf);

                return (
                  <MemberCard
                    key={member.id}
                    member={member}
                    loading={
                      updatingMemberId === member.id ||
                      removingMemberId === member.id
                    }
                    canEditRole={canEditRole}
                    canRemove={
                      canRemove && !(isOwnerMember && member.userId === currentUserId)
                    }
                    onRoleChange={(role) => {
                      void handleRoleChange(member, role);
                    }}
                    onRemove={
                      canRemove
                        ? () => {
                            void handleRemoveMember(member);
                          }
                        : undefined
                    }
                  />
                );
              })
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
};

export default MembersPage;
