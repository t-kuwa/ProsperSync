import { useCallback, useEffect, useState } from "react";
import AuthPage from "./features/auth/AuthPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import BudgetsPage from "./features/budgets/BudgetsPage";
import type { AuthSuccess } from "./features/auth/types";
import { DashboardProvider } from "./features/dashboard/context/DashboardContext";
import TransactionsPage from "./features/transactions/TransactionsPage";
import { AccountProvider } from "./features/accounts/context/AccountContext";
import { apiClient, AUTH_ERROR_EVENT } from "./api/client";
import AccountCreatePage from "./features/accounts/components/AccountCreatePage";
import AccountSettingsPage from "./features/accounts/components/AccountSettingsPage";
import MembersPage from "./features/accounts/components/MembersPage";
import {
  APP_ROUTES,
  matchAccountRoute,
  type AppRoute,
} from "./routes";
import { MainLayout } from "./components/layout/MainLayout";
import { logoutUser } from "./features/auth/api";

const STORAGE_KEY = "haruve-auth";

const getInitialAuth = (): AuthSuccess | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as AuthSuccess;

    if (!parsed?.user?.id || !parsed?.token) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const resolveRoute = (path: string): AppRoute => {
  if (
    path === APP_ROUTES.dashboard ||
    path === APP_ROUTES.transactions ||
    path === APP_ROUTES.budgets ||
    path === APP_ROUTES.accountCreate
  ) {
    return path;
  }

  const accountRoute = matchAccountRoute(path);
  if (accountRoute) {
    return path as AppRoute;
  }

  return APP_ROUTES.dashboard;
};

const getInitialRoute = (): AppRoute => {
  if (typeof window === "undefined") {
    return APP_ROUTES.dashboard;
  }

  const path = window.location.pathname;
  return resolveRoute(path);
};

const App = () => {
  const [auth, setAuth] = useState<AuthSuccess | null>(() => getInitialAuth());
  const [route, setRoute] = useState<AppRoute>(() => getInitialRoute());
  const [isAuthHeaderReady, setIsAuthHeaderReady] = useState(false);

  const navigate = useCallback(
    (nextRoute: AppRoute, options?: { replace?: boolean }) => {
      setRoute(nextRoute);

      if (typeof window === "undefined") {
        return;
      }

      const method = options?.replace ? "replaceState" : "pushState";
      window.history[method]({}, "", nextRoute);
    },
    [],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePopState = () => {
      setRoute(resolveRoute(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (auth) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      navigate(APP_ROUTES.dashboard, { replace: true });
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.history.replaceState({}, "", "/login");
    }
  }, [auth, navigate]);

  useEffect(() => {
    if (!auth) {
      delete apiClient.defaults.headers.common.Authorization;
      setIsAuthHeaderReady(false);
    } else {
      apiClient.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
      // Authorizationヘッダーが設定されたことを示すフラグを設定
      // 次のレンダリングサイクルで確実に反映されるようにする
      setTimeout(() => setIsAuthHeaderReady(true), 0);
    }
  }, [auth]);

  // 401エラー時の自動ログアウト処理
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleAuthError = () => {
      delete apiClient.defaults.headers.common.Authorization;
      setAuth(null);
    };

    window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);
    return () => window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
  }, []);

  useEffect(() => {
    if (!auth || typeof window === "undefined") {
      return;
    }

    const accountRoute = matchAccountRoute(route);

    const title = (() => {
      if (route === APP_ROUTES.dashboard) {
        return "ダッシュボード - Haruve";
      }
      if (route === APP_ROUTES.transactions) {
        return "収支登録 - Haruve";
      }
      if (route === APP_ROUTES.accountCreate) {
        return "アカウント作成 - Haruve";
      }
      if (route === APP_ROUTES.budgets) {
        return "予算管理 - Haruve";
      }
      if (accountRoute?.type === "settings") {
        return "アカウント設定 - Haruve";
      }
      if (accountRoute?.type === "members") {
        return "メンバー管理 - Haruve";
      }
      return "Haruve";
    })();

    document.title = title;
  }, [auth, route]);

  const accountRouteMatch = matchAccountRoute(route);

  if (!auth) {
    return (
      <AuthPage
        onAuthenticated={(authData) => {
          apiClient.defaults.headers.common.Authorization = `Bearer ${authData.token}`;
          setAuth(authData);
          navigate(APP_ROUTES.dashboard);
        }}
      />
    );
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      delete apiClient.defaults.headers.common.Authorization;
      setAuth(null);
      setRoute(APP_ROUTES.dashboard);
    }
  };

  const renderPage = () => {
    if (route === APP_ROUTES.dashboard) {
      return (
        <DashboardPage />
      );
    }

    if (route === APP_ROUTES.transactions) {
      return (
        <TransactionsPage />
      );
    }

    if (route === APP_ROUTES.budgets) {
      return (
        <BudgetsPage />
      );
    }

    if (route === APP_ROUTES.accountCreate) {
      return (
        <AccountCreatePage
          onNavigate={navigate}
        />
      );
    }

    if (accountRouteMatch?.type === "settings") {
      return (
        <AccountSettingsPage
          currentUserId={auth.user.id}
        />
      );
    }

    if (accountRouteMatch?.type === "members") {
      return (
        <MembersPage
          currentUserId={auth.user.id}
        />
      );
    }

    return (
      <DashboardPage />
    );
  };

  // Authorizationヘッダーが設定されるまでAccountProviderのマウントを遅延
  if (!isAuthHeaderReady) {
    return null; // またはローディング表示
  }

  return (
    <AccountProvider
      key={auth.user.id}
      initialAccountId={auth.user.primaryAccountId}
    >
      <DashboardProvider>
        <MainLayout
          userName={auth.user.name}
          onLogout={handleLogout}
          currentPath={route}
          onNavigate={(path) => navigate(path as AppRoute)}
        >
          {renderPage()}
        </MainLayout>
      </DashboardProvider>
    </AccountProvider>
  );
};

export default App;
