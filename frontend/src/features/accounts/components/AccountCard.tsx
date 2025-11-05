import type { AccountSummary } from "../types";

type AccountCardProps = {
  account: AccountSummary;
};

const badgeStyle = (type: AccountSummary["accountType"]) =>
  type === "personal"
    ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
    : "bg-indigo-50 text-indigo-600 ring-indigo-100";

const typeLabel = (type: AccountSummary["accountType"]) =>
  type === "personal" ? "個人アカウント" : "チームアカウント";

const AccountCard = ({ account }: AccountCardProps) => (
  <article className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <header className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {account.name}
        </h2>
        <p className="text-xs text-slate-500">Slug: {account.slug}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeStyle(account.accountType)}`}
      >
        {typeLabel(account.accountType)}
      </span>
    </header>

    <dl className="grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2">
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">
          説明
        </dt>
        <dd className="mt-1 text-slate-700">
          {account.description || "説明は設定されていません。"}
        </dd>
      </div>

      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">
          オーナー
        </dt>
        <dd className="mt-1 text-slate-700">
          {account.owner
            ? `${account.owner.name}（${account.owner.email}）`
            : "不明"}
        </dd>
      </div>

      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">
          作成日
        </dt>
        <dd className="mt-1 text-slate-700">
          {new Date(account.createdAt).toLocaleString("ja-JP")}
        </dd>
      </div>

      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">
          最終更新日
        </dt>
        <dd className="mt-1 text-slate-700">
          {new Date(account.updatedAt).toLocaleString("ja-JP")}
        </dd>
      </div>
    </dl>
  </article>
);

export default AccountCard;
