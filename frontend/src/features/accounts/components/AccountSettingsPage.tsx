import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import { getMembers } from "../../../api/accounts";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import useAccountState from "../hooks/useAccountState";
import type { Membership } from "../types";

type AccountFormValues = {
  name: string;
  description: string;
};

type AccountSettingsPageProps = {
  currentUserId: number;
};

const AccountSettingsPage = ({
  currentUserId,
}: AccountSettingsPageProps) => {
  const {
    currentAccount,
    processing,
    updateAccountDetails,
  } = useAccountState();
  const [members, setMembers] = useState<Membership[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<AccountFormValues>({
    name: "",
    description: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    if (!currentAccount) {
      setMembers([]);
      return;
    }

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
  }, [currentAccount, isEditing]);

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-left">
        <h1 className="text-2xl font-bold text-text-primary">アカウント設定</h1>
        <p className="mt-1 text-sm text-text-secondary">
          現在のアカウントの設定を確認・変更できます。
        </p>
      </div>

      {!currentAccount ? (
        <Card className="p-6 text-sm text-text-secondary">
          アカウントが選択されていません。サイドバーからワークスペースを選択してください。
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
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

          <Card className="p-6">
            <header className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={formValues.name}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="アカウント名"
                    maxLength={80}
                    required
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-text-primary">
                    {currentAccount.name}
                  </h2>
                )}
              </div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 ring-1 ring-green-100">
                {currentAccount.accountType === "personal"
                  ? "個人アカウント"
                  : "チームアカウント"}
              </span>
            </header>

            <dl className="grid grid-cols-1 gap-6 text-sm text-text-secondary md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                  説明
                </dt>
                <dd className="text-text-primary">
                  {isEditing ? (
                    <textarea
                      value={formValues.description}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary"
                      placeholder="説明を入力してください"
                    />
                  ) : (
                    currentAccount.description || "説明は設定されていません。"
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                  オーナー
                </dt>
                <dd className="text-text-primary">
                  {currentAccount.owner
                    ? `${currentAccount.owner.name}（${currentAccount.owner.email}）`
                    : "不明"}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                  作成日
                </dt>
                <dd className="text-text-primary">
                  {new Date(currentAccount.createdAt).toLocaleString("ja-JP")}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                  最終更新日
                </dt>
                <dd className="text-text-primary">
                  {new Date(currentAccount.updatedAt).toLocaleString("ja-JP")}
                </dd>
              </div>
            </dl>

            {isOwner && (
              <div className="flex gap-3 pt-6 mt-6 border-t border-border">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={processing}
                      variant="primary"
                      size="sm"
                      isLoading={processing}
                    >
                      保存
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={processing}
                      variant="outline"
                      size="sm"
                    >
                      キャンセル
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    編集
                  </Button>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">あなたの役職</h2>
            <p className="text-sm text-text-secondary">
              {isOwner
                ? "あなたはこのワークスペースのオーナーです。"
                : "あなたはこのワークスペースのメンバーです。アカウント情報を編集できません。"}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsPage;
