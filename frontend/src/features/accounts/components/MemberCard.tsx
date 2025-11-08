import type { Membership, MembershipRole } from "../types";

type MemberCardProps = {
  member: Membership;
  loading?: boolean;
  canEditRole?: boolean;
  canRemove?: boolean;
  onRoleChange?: (nextRole: MembershipRole) => void;
  onRemove?: () => void;
};

const roleLabel = (role: MembershipRole) =>
  role === "owner" ? "オーナー" : "メンバー";

const roleOptions: MembershipRole[] = ["owner", "member"];

const MemberCard = ({
  member,
  loading = false,
  canEditRole = true,
  canRemove = true,
  onRoleChange,
  onRemove,
}: MemberCardProps) => (
  <article className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <header className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {member.user?.name ?? `ユーザー#${member.userId}`}
        </h3>
        <p className="text-xs text-slate-500">
          {member.user?.email ?? "メールアドレス未取得"}
        </p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          member.role === "owner"
            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
        }`}
      >
        {roleLabel(member.role)}
      </span>
    </header>

    <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500">
      <div>
        <dt className="uppercase tracking-wide text-slate-400">参加日</dt>
        <dd className="mt-1 text-slate-600">
          {member.joinedAt
            ? new Date(member.joinedAt).toLocaleString("ja-JP")
            : "未設定"}
        </dd>
      </div>
      <div>
        <dt className="uppercase tracking-wide text-slate-400">ユーザーID</dt>
        <dd className="mt-1 text-slate-600">{member.userId}</dd>
      </div>
    </dl>

    <footer className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-2">
        <span className="text-xs text-slate-500">ロール</span>
        <select
          value={member.role}
          disabled={!canEditRole || loading}
          onChange={(event) => {
            onRoleChange?.(event.target.value as MembershipRole);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove || loading}
        className="inline-flex items-center justify-center rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
      >
        メンバーを削除
      </button>
    </footer>
  </article>
);

export default MemberCard;
