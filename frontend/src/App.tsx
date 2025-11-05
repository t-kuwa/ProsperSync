import { useCallback, useEffect, useState } from "react";
import AuthPage from "./features/auth/AuthPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import type { AuthSuccess } from "./features/auth/types";
import { DashboardProvider } from "./features/dashboard/hooks/useDashboardState";
import TransactionsPage from "./features/transactions/TransactionsPage";
import { AccountProvider } from "./features/accounts/hooks/useAccountState";
import { apiClient } from "./api/client";
import AccountCreatePage from "./features/accounts/components/AccountCreatePage";
import AccountSettingsPage from "./features/accounts/components/AccountSettingsPage";
import MembersPage from "./features/accounts/components/MembersPage";
import {
  APP_ROUTES,
  matchAccountRoute,
  type AppRoute,
} from "./routes";
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
    } else {
      apiClient.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
    }
  }, [auth]);

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
        return "トランザクション - Haruve";
      }
      if (route === APP_ROUTES.accountCreate) {
        return "アカウント作成 - Haruve";
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
        <DashboardPage
          userName={auth.user.name}
          currentRoute={route}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      );
    }

    if (route === APP_ROUTES.transactions) {
      return (
        <TransactionsPage
          userName={auth.user.name}
          currentRoute={route}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      );
    }

    if (route === APP_ROUTES.accountCreate) {
      return (
        <AccountCreatePage
          userName={auth.user.name}
          currentRoute={route}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      );
    }

    if (accountRouteMatch?.type === "settings") {
      return (
        <AccountSettingsPage
          userName={auth.user.name}
          currentRoute={route}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      );
    }

    if (accountRouteMatch?.type === "members") {
      return (
        <MembersPage
          userName={auth.user.name}
          currentUserId={auth.user.id}
          currentRoute={route}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      );
    }

    return (
      <DashboardPage
        userName={auth.user.name}
        currentRoute={APP_ROUTES.dashboard}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    );
  };

  return (
    <AccountProvider
      key={auth.user.id}
      initialAccountId={auth.user.primaryAccountId}
    >
      <DashboardProvider>{renderPage()}</DashboardProvider>
    </AccountProvider>
  );
};

export default App;
