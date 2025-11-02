import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FinancialEntry = {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note?: string;
};

export type Account = {
  id: number;
  name: string;
  balance: number;
  currency: string;
  members: number;
  status: "active" | "pending" | "inactive";
};

export type Member = {
  id: number;
  name: string;
  role: string;
  email: string;
  status: "active" | "invited";
  lastActivity: string;
};

export type EntryFormState = {
  type: "income" | "expense";
  category: string;
  amount: string;
  date: string;
  note: string;
};

export type AccountFormState = {
  name: string;
  balance: string;
  currency: string;
  members: string;
  status: "active" | "pending" | "inactive";
};

export type MemberFormState = {
  name: string;
  role: string;
  email: string;
};

export type FormChangeHandler<FormState> = <
  Field extends keyof FormState,
>(
  field: Field,
  value: FormState[Field],
) => void;

const initialEntries: FinancialEntry[] = [
  {
    id: 1,
    type: "income",
    category: "顧客請求",
    amount: 420000,
    date: "2025-01-05",
    note: "1月分の導入コンサルティング料",
  },
  {
    id: 2,
    type: "expense",
    category: "マーケティング",
    amount: 85000,
    date: "2025-01-07",
    note: "広告出稿（SNSキャンペーン）",
  },
  {
    id: 3,
    type: "expense",
    category: "サブスクリプション",
    amount: 32000,
    date: "2025-01-10",
    note: "クラウドインフラ利用料",
  },
  {
    id: 4,
    type: "income",
    category: "プロフェッショナルサービス",
    amount: 260000,
    date: "2025-01-12",
    note: "カスタム連携開発",
  },
];

const initialAccounts: Account[] = [
  {
    id: 1,
    name: "Haruve 事業口座",
    balance: 2450000,
    currency: "JPY",
    members: 5,
    status: "active",
  },
  {
    id: 2,
    name: "海外収益口座",
    balance: 580000,
    currency: "USD",
    members: 2,
    status: "pending",
  },
  {
    id: 3,
    name: "研究開発ファンド",
    balance: 1250000,
    currency: "JPY",
    members: 3,
    status: "active",
  },
];

const initialMembers: Member[] = [
  {
    id: 1,
    name: "向島 玲奈",
    role: "ファイナンス",
    email: "rena.mukojima@example.com",
    status: "active",
    lastActivity: "2時間前",
  },
  {
    id: 2,
    name: "根本 大輝",
    role: "管理部門",
    email: "daiki.nemoto@example.com",
    status: "active",
    lastActivity: "昨日",
  },
  {
    id: 3,
    name: "木村 瞳",
    role: "経営層",
    email: "hitomi.kimura@example.com",
    status: "invited",
    lastActivity: "招待メール送信済み",
  },
];

const initialEntryForm: EntryFormState = {
  type: "income",
  category: "",
  amount: "",
  date: "",
  note: "",
};

const initialAccountForm: AccountFormState = {
  name: "",
  balance: "",
  currency: "JPY",
  members: "1",
  status: "active",
};

const initialMemberForm: MemberFormState = {
  name: "",
  role: "",
  email: "",
};

const useDashboardStateInternal = () => {
  const [entries, setEntries] = useState<FinancialEntry[]>(initialEntries);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [entryForm, setEntryForm] = useState<EntryFormState>(initialEntryForm);
  const [accountForm, setAccountForm] =
    useState<AccountFormState>(initialAccountForm);
  const [memberForm, setMemberForm] =
    useState<MemberFormState>(initialMemberForm);

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        if (entry.type === "income") {
          acc.income += entry.amount;
        } else {
          acc.expense += entry.amount;
        }

        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [entries]);

  const netCashflow = totals.income - totals.expense;
  const runRate =
    entries.length > 0 ? Math.round((totals.income / entries.length) * 4) : 0;
  const growthRatio =
    totals.expense === 0 ? 0 : (netCashflow / totals.expense) * 100;
  const inflowOutflowRatio =
    totals.income === 0
      ? 0
      : Math.min(
          100,
          Math.max(0, Math.round((totals.expense / totals.income) * 100)),
        );

  const recentEntries = useMemo(
    () =>
      [...entries]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    [entries],
  );

  const totalAccountBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const handleEntryFormChange: FormChangeHandler<EntryFormState> = (
    field,
    value,
  ) => {
    setEntryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAccountFormChange: FormChangeHandler<AccountFormState> = (
    field,
    value,
  ) => {
    setAccountForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMemberFormChange: FormChangeHandler<MemberFormState> = (
    field,
    value,
  ) => {
    setMemberForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEntrySubmit = () => {
    const amount = Number(entryForm.amount);

    if (!entryForm.category || !entryForm.date || Number.isNaN(amount)) {
      return;
    }

    setEntries((prev) => [
      {
        id: Date.now(),
        type: entryForm.type,
        category: entryForm.category,
        amount,
        date: entryForm.date,
        note: entryForm.note || undefined,
      },
      ...prev,
    ]);

    setEntryForm(initialEntryForm);
  };

  const handleAccountSubmit = () => {
    const balance = Number(accountForm.balance);
    const memberCount = Number(accountForm.members);

    if (!accountForm.name || Number.isNaN(balance) || Number.isNaN(memberCount)) {
      return;
    }

    setAccounts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: accountForm.name,
        balance,
        currency: accountForm.currency,
        members: memberCount,
        status: accountForm.status,
      },
    ]);

    setAccountForm(initialAccountForm);
  };

  const handleMemberSubmit = () => {
    if (!memberForm.name || !memberForm.role || !memberForm.email) {
      return;
    }

    setMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: memberForm.name,
        role: memberForm.role,
        email: memberForm.email,
        status: "invited",
        lastActivity: "招待メール送信済み",
      },
    ]);

    setMemberForm(initialMemberForm);
  };

  return {
    entries,
    accounts,
    members,
    entryForm,
    accountForm,
    memberForm,
    totals,
    netCashflow,
    runRate,
    growthRatio,
    inflowOutflowRatio,
    recentEntries,
    totalAccountBalance,
    handleEntryFormChange,
    handleAccountFormChange,
    handleMemberFormChange,
    handleEntrySubmit,
    handleAccountSubmit,
    handleMemberSubmit,
  };
};

type DashboardState = ReturnType<typeof useDashboardStateInternal>;

const DashboardStateContext = createContext<DashboardState | null>(null);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const value = useDashboardStateInternal();

  return (
    <DashboardStateContext.Provider value={value}>
      {children}
    </DashboardStateContext.Provider>
  );
};

const useDashboardState = () => {
  const context = useContext(DashboardStateContext);

  if (!context) {
    throw new Error("useDashboardState must be used within DashboardProvider");
  }

  return context;
};

export default useDashboardState;
