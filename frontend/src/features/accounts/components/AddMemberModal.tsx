import { useEffect, type FormEventHandler } from "react";
import type { MembershipRole } from "../types";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

type AddMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  userId: string;
  role: MembershipRole;
  onUserIdChange: (value: string) => void;
  onRoleChange: (role: MembershipRole) => void;
  isOwner: boolean;
  creating: boolean;
  error: string | null;
};

const AddMemberModal = ({
  isOpen,
  onClose,
  onSubmit,
  userId,
  role,
  onUserIdChange,
  onRoleChange,
  isOwner,
  creating,
  error,
}: AddMemberModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">メンバーを追加</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary transition hover:bg-surface hover:text-text-primary"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          既存ユーザーのIDを指定して招待します。オーナーのみが追加できます。
        </p>

        {!isOwner ? (
          <div className="mb-4 rounded-xl bg-surface px-3 py-2 text-xs text-text-secondary">
            メンバーを追加するにはオーナー権限が必要です。
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="ユーザーID"
            type="number"
            inputMode="numeric"
            value={userId}
            onChange={(event) => onUserIdChange(event.target.value)}
            disabled={!isOwner || creating}
            placeholder="例: 42"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-secondary">
              ロール
            </label>
            <select
              value={role}
              onChange={(event) =>
                onRoleChange(event.target.value as MembershipRole)
              }
              disabled={!isOwner || creating}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-surface"
            >
              <option value="member">メンバー</option>
              <option value="owner">オーナー</option>
            </select>
          </div>

          {error ? (
            <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              disabled={creating}
              variant="outline"
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!isOwner || creating}
              variant="primary"
              isLoading={creating}
              className="flex-1"
            >
              メンバーを追加
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddMemberModal;

