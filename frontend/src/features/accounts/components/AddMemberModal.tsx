import { useEffect, type FormEventHandler } from "react";
import type { MembershipRole } from "../types";

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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">メンバーを追加</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-500">
          既存ユーザーのIDを指定して招待します。オーナーのみが追加できます。
        </p>

        {!isOwner ? (
          <div className="mb-4 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-500">
            メンバーを追加するにはオーナー権限が必要です。
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-slate-700">
            ユーザーID
            <input
              type="number"
              inputMode="numeric"
              value={userId}
              onChange={(event) => onUserIdChange(event.target.value)}
              disabled={!isOwner || creating}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="例: 42"
              required
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            ロール
            <select
              value={role}
              onChange={(event) =>
                onRoleChange(event.target.value as MembershipRole)
              }
              disabled={!isOwner || creating}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="member">メンバー</option>
              <option value="owner">オーナー</option>
            </select>
          </label>

          {error ? (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {error}
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!isOwner || creating}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {creating ? "追加中..." : "メンバーを追加"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;

