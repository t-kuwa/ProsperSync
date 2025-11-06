import { useEffect, useMemo, useRef, useState } from "react";
import useAccountState from "../../accounts/hooks/useAccountState";
import type { AccountSummary } from "../../accounts/types";

type AccountSwitcherProps = {
  onSelect?: (account: AccountSummary) => void;
};

const accountTypeLabel = (account: AccountSummary) =>
  account.accountType === "personal" ? "個人" : "チーム";

const AccountBadge = ({ account }: { account: AccountSummary }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
      account.accountType === "personal"
        ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
        : "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
    }`}
  >
    {accountTypeLabel(account)}
  </span>
);

const AccountSwitcher = ({ onSelect }: AccountSwitcherProps) => {
  const {
    accounts,
    currentAccount,
    loading,
    error,
    selectAccount,
    refreshAccounts,
  } = useAccountState();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // 全てのワークスペースを表示（現在のワークスペースも含む）
  const allAccounts = useMemo(() => accounts, [accounts]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200 shadow-sm">
        アカウントを読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
        {error}
        <button
          type="button"
          onClick={() => {
            void refreshAccounts();
          }}
          className="ml-2 rounded-full border border-rose-200 px-2 py-0.5 text-xs text-rose-500 transition hover:bg-rose-100"
        >
          再読み込み
        </button>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-200 shadow-sm">
        表示できるアカウントがありません。
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-left shadow-sm shadow-slate-900/30 transition hover:bg-slate-800"
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {currentAccount.name}
          </span>
          <span className="text-xs text-slate-300">
            {accountTypeLabel(currentAccount)}
          </span>
        </div>
        <span className="text-slate-400">▾</span>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-[110%] z-20 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
          <div className="max-h-60 overflow-y-auto px-4 py-3">
            {allAccounts.length ? (
              <ul className="space-y-2">
                {allAccounts.map((account) => {
                  const isCurrent = account.id === currentAccount?.id;
                  return (
                    <li key={account.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isCurrent) {
                            selectAccount(account.id);
                            onSelect?.(account);
                          }
                          setOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                          isCurrent
                            ? "bg-slate-50 cursor-default"
                            : "hover:bg-slate-50 cursor-pointer"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {account.name}
                          </p>
                        </div>
                        <AccountBadge account={account} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                ワークスペースがありません。
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AccountSwitcher;
