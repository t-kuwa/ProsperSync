import { useMemo } from "react";
import type { AppRoute } from "../../routes";
import CalendarOverview from "../dashboard/components/CalendarOverview";
import DashboardShell from "../dashboard/components/DashboardShell";
import useDashboardState from "../dashboard/hooks/useDashboardState";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";

type TransactionsPageProps = {
  userName?: string;
  onLogout?: () => void;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

const TransactionsPage = ({
  userName,
  onLogout,
  currentRoute,
  onNavigate,
}: TransactionsPageProps) => {
  const {
    entries,
    entryForm,
    handleEntryFormChange,
    handleEntrySubmit,
  } = useDashboardState();

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries],
  );

  const headerActions = (
    <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm ring-1 ring-slate-200">
      <span className="text-lg">🔍</span>
      <input
        placeholder="取引を検索"
        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:w-72"
      />
    </div>
  );

  return (
    <DashboardShell
      userName={userName}
      onLogout={onLogout}
      currentRoute={currentRoute}
      onNavigate={onNavigate}
      headerTitle="トランザクション管理"
      headerSubtitle="実際の収支登録と履歴確認ができます。"
      headerActions={headerActions}
    >
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <TransactionForm
          entryForm={entryForm}
          onChange={handleEntryFormChange}
          onSubmit={handleEntrySubmit}
        />

        <div className="space-y-6">
          <CalendarOverview entries={entries} />
          <TransactionList entries={sortedEntries} />
        </div>
      </div>
    </DashboardShell>
  );
};

export default TransactionsPage;
