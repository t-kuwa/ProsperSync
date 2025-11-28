import React, { useState } from "react";
import { APP_ROUTES } from "../../routes";
import { Button } from "../ui/Button";
import useAccountState from "../../features/accounts/hooks/useAccountState";
import { Card } from "../ui/Card";

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  userName?: string;
  onLogout?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  userName,
  onLogout,
  className = "",
}) => {
  const { accounts, currentAccount, selectAccount } = useAccountState();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const navItems = [
    { path: APP_ROUTES.dashboard, label: "ダッシュボード", icon: "dashboard" },
    { path: APP_ROUTES.transactions, label: "収支管理", icon: "receipt_long" },
    { path: APP_ROUTES.fixedRecurring, label: "固定収支", icon: "repeat" },
    { path: APP_ROUTES.invoices, label: "請求書", icon: "request_quote" },
    { path: APP_ROUTES.budgets, label: "予算管理", icon: "pie_chart" },
  ];

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsAccountMenuOpen(false);
  };

  const handleSwitchAccount = (accountId: number) => {
    selectAccount(accountId);
    setIsAccountMenuOpen(false);
    onNavigate(APP_ROUTES.dashboard);
  };

  return (
    <aside className={`flex flex-col w-64 bg-surface/80 backdrop-blur-xl border-r border-border h-screen sticky top-0 ${className}`}>
      {/* Workspace Switcher */}
      <div className="p-4">
        <div className="relative">
          <button
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-background transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
              {currentAccount?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {currentAccount?.name}
              </p>
              <p className="text-xs text-text-secondary truncate group-hover:text-text-primary transition-colors">
                フリープラン
              </p>
            </div>
            <span className="material-icons text-text-secondary text-sm">unfold_more</span>
          </button>

          {isAccountMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsAccountMenuOpen(false)}
              />
              <Card className="absolute top-full left-0 w-full mt-2 z-20 p-1 shadow-lg animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 text-xs font-medium text-text-secondary">
                  アカウントを切り替え
                </div>
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleSwitchAccount(account.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      currentAccount?.id === account.id
                        ? "bg-surface text-text-primary"
                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                    }`}
                  >
                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-[10px] text-primary font-semibold">
                      {account.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{account.name}</span>
                    {currentAccount?.id === account.id && (
                      <span className="material-icons text-sm text-primary ml-auto">check</span>
                    )}
                  </button>
                ))}
                <div className="my-1 border-t border-border/50" />
                <button
                  onClick={() => handleNavigate(APP_ROUTES.accountCreate)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary rounded-lg transition-colors"
                >
                  <span className="material-icons text-sm">add</span>
                  新しいアカウントを作成
                </button>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
          メニュー
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-ai-gradient text-white shadow-ai-glow"
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
              }`}
            >
              <span className={`material-icons text-[20px] ${isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}

        {currentAccount && (
          <>
            <div className="mt-6 px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              アカウント
            </div>
            <button
              onClick={() => handleNavigate(APP_ROUTES.accountSettings(currentAccount.id))}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                currentPath.includes("/settings")
                  ? "bg-ai-gradient text-white shadow-ai-glow"
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
              }`}
            >
              <span className={`material-icons text-[20px] ${currentPath.includes("/settings") ? "text-white" : ""}`}>settings</span>
              設定
            </button>
            <button
              onClick={() => handleNavigate(APP_ROUTES.accountMembers(currentAccount.id))}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                currentPath.includes("/members")
                  ? "bg-ai-gradient text-white shadow-ai-glow"
                  : "text-text-secondary hover:bg-background hover:text-text-primary"
              }`}
            >
              <span className={`material-icons text-[20px] ${currentPath.includes("/members") ? "text-white" : ""}`}>group</span>
              メンバー
            </button>
          </>
        )}
      </nav>

      {/* User Profile */}
      {userName && (
        <div className="p-4 border-t border-border bg-background/50">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-ai-gradient flex items-center justify-center text-white font-semibold text-xs shadow-ai-glow">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {userName}
              </p>
              <p className="text-xs text-text-secondary truncate">
                プロフィールを見る
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-text-secondary hover:text-red-500 hover:bg-red-50 h-9"
          >
            <span className="material-icons text-lg mr-2">logout</span>
            ログアウト
          </Button>
        </div>
      )}
    </aside>
  );
};
