import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "../../../api/accounts";
import { getErrorMessage } from "../../../api/client";
import type {
  AccountSummary,
  CreateAccountPayload,
  UpdateAccountPayload,
} from "../types";

export type AccountContextValue = {
  accounts: AccountSummary[];
  currentAccountId: number | null;
  currentAccount: AccountSummary | null;
  loading: boolean;
  processing: boolean;
  error: string | null;
  selectAccount: (accountId: number) => void;
  refreshAccounts: () => Promise<void>;
  createTeamAccount: (payload: CreateAccountPayload) => Promise<AccountSummary>;
  updateAccountDetails: (
    accountId: number,
    payload: UpdateAccountPayload,
  ) => Promise<AccountSummary>;
  deleteAccountById: (accountId: number) => Promise<void>;
};

export const AccountContext = createContext<AccountContextValue | null>(null);

type AccountProviderProps = {
  children: ReactNode;
  initialAccountId?: number | null;
};

export const AccountProvider = ({
  children,
  initialAccountId = null,
}: AccountProviderProps) => {
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<number | null>(
    initialAccountId,
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAccounts();
  }, [refreshAccounts]);

  useEffect(() => {
    if (!accounts.length) {
      return;
    }

    // initialAccountIdが設定されていて、現在のアカウントIDが設定されていない場合のみ初期化
    if (
      initialAccountId &&
      !currentAccountId &&
      accounts.some((account) => account.id === initialAccountId)
    ) {
      setCurrentAccountId(initialAccountId);
      return;
    }

    // 現在のアカウントIDが有効なアカウントに存在する場合は何もしない
    if (
      currentAccountId &&
      accounts.some((account) => account.id === currentAccountId)
    ) {
      return;
    }

    // 現在のアカウントIDが無効な場合、最初のアカウントを選択
    setCurrentAccountId(accounts[0]?.id ?? null);
  }, [accounts, currentAccountId, initialAccountId]);

  const selectAccount = useCallback((accountId: number) => {
    setCurrentAccountId(accountId);
  }, []);

  const createTeamAccount = useCallback(
    async (payload: CreateAccountPayload) => {
      setProcessing(true);
      setError(null);

      try {
        const account = await createAccount(payload);
        setAccounts((prev) => [...prev, account]);
        setCurrentAccountId(account.id);
        return account;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [],
  );

  const updateAccountDetails = useCallback(
    async (accountId: number, payload: UpdateAccountPayload) => {
      setProcessing(true);
      setError(null);

      try {
        const nextAccount = await updateAccount(accountId, payload);
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId ? nextAccount : account,
          ),
        );
        return nextAccount;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [],
  );

  const deleteAccountById = useCallback(async (accountId: number) => {
    setProcessing(true);
    setError(null);

    try {
      await deleteAccount(accountId);
      setAccounts((prev) => {
        const next = prev.filter((account) => account.id !== accountId);
        setCurrentAccountId((current) => {
          if (current !== accountId) {
            return current;
          }

          return next[0]?.id ?? null;
        });
        return next;
      });
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  const value = useMemo<AccountContextValue>(() => {
    const currentAccount =
      accounts.find((account) => account.id === currentAccountId) ?? null;

    return {
      accounts,
      currentAccount,
      currentAccountId,
      loading,
      processing,
      error,
      selectAccount,
      refreshAccounts,
      createTeamAccount,
      updateAccountDetails,
      deleteAccountById,
    };
  }, [
    accounts,
    currentAccountId,
    loading,
    processing,
    error,
    selectAccount,
    refreshAccounts,
    createTeamAccount,
    updateAccountDetails,
    deleteAccountById,
  ]);

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};
