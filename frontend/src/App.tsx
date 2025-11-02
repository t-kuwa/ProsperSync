import { useCallback, useEffect, useState } from "react";
import AuthPage from "./features/auth/AuthPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import type { AuthSuccess } from "./features/auth/types";
import { DashboardProvider } from "./features/dashboard/hooks/useDashboardState";
import TransactionsPage from "./features/transactions/TransactionsPage";
import { APP_ROUTES, type AppRoute } from "./routes";

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
    return JSON.parse(stored) as AuthSuccess;
  } catch {
    return null;
  }
};

const isAppRoute = (path: string): path is AppRoute =>
  path === APP_ROUTES.dashboard || path === APP_ROUTES.transactions;

const getInitialRoute = (): AppRoute => {
  if (typeof window === "undefined") {
    return APP_ROUTES.dashboard;
  }

  const path = window.location.pathname;
  return isAppRoute(path) ? path : APP_ROUTES.dashboard;
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
      const path = window.location.pathname;
      if (isAppRoute(path)) {
        setRoute(path);
      }
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
    if (!auth || typeof window === "undefined") {
      return;
    }

    document.title =
      route === APP_ROUTES.dashboard
        ? "ダッシュボード - Haruve"
        : "トランザクション - Haruve";
  }, [auth, route]);

  if (!auth) {
    return (
      <AuthPage
        onAuthenticated={(authData) => {
          setAuth(authData);
          navigate(APP_ROUTES.dashboard);
        }}
      />
    );
  }

  const handleLogout = () => {
    setAuth(null);
    setRoute(APP_ROUTES.dashboard);
  };

  return (
    <DashboardProvider>
      {route === APP_ROUTES.dashboard ? (
        <DashboardPage
          userName={auth.user.name}
          currentRoute={route}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      ) : (
        <TransactionsPage
          userName={auth.user.name}
          currentRoute={route}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
    </DashboardProvider>
  );
};

export default App;
