import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import {
  createMember,
  deleteMember,
  getMembers,
  updateMember,
} from "../../../api/accounts";
import useAccountState from "../hooks/useAccountState";
import type { Membership, MembershipRole } from "../types";
import AddMemberModal from "./AddMemberModal";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

type MembersPageProps = {
  currentUserId: number;
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
  currentUserId,
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-text-primary">メンバー管理</h1>
          <p className="mt-1 text-sm text-text-secondary">
            ワークスペースのメンバーを管理します。
          </p>
        </div>
        {isOwner && currentAccount && (
          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <span className="material-icons text-lg">add</span>
            メンバーを追加
          </Button>
        )}
      </div>

      {!currentAccount ? (
        <Card className="p-6 text-sm text-text-secondary">
          アカウントが選択されていません。サイドバーからワークスペースを選択してください。
        </Card>
      ) : (
        <>
          <div className="mb-4 rounded-3xl bg-surface/50 px-5 py-3 text-sm text-text-secondary shadow-sm ring-1 ring-border">
            <span className="font-semibold text-text-primary">
              {currentAccount.name}
            </span>
            <span className="ml-2 text-xs text-text-secondary">
              メンバー数: {members.length}
            </span>
          </div>
          <div className="flex w-full flex-col gap-4">
            {status ? (
              <Card className="bg-green-50 border-green-100 p-4 text-sm text-green-600">
                {status}
              </Card>
            ) : null}

            {error ? (
              <Card className="bg-red-50 border-red-100 p-4 text-sm text-red-600">
                {error}
              </Card>
            ) : null}

            {loading ? (
              <Card className="p-6 text-sm text-text-secondary">
                メンバーを読み込み中です...
              </Card>
            ) : members.length === 0 ? (
              <Card className="p-6 text-sm text-text-secondary">
                登録されているメンバーはいません。
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-surface border-b border-border">
                      <tr>
                        <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          アイコン
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          名前
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          メールアドレス
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          ロール
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          参加日
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          最終ログイン日
                        </th>
                        <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          アクション
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background">
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
                            className="transition hover:bg-surface/50"
                          >
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm font-semibold text-text-secondary ring-1 ring-border">
                                {initials}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">
                              {memberName}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                              {memberEmail}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  member.role === "owner"
                                    ? "bg-green-50 text-green-600 ring-1 ring-green-100"
                                    : "bg-surface text-text-secondary ring-1 ring-border"
                                }`}
                              >
                                {member.role === "owner" ? "オーナー" : "メンバー"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
                              {joinedDate}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">
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
                                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text-primary shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface"
                                  >
                                    <option value="member">メンバー</option>
                                    <option value="owner">オーナー</option>
                                  </select>
                                )}
                                {canRemoveFinal && (
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      void handleRemoveMember(member);
                                    }}
                                    disabled={
                                      updatingMemberId === member.id ||
                                      removingMemberId === member.id
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                  >
                                    {removingMemberId === member.id
                                      ? "削除中..."
                                      : "削除"}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
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
    </div>
  );
};

export default MembersPage;
