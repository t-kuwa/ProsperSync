export type AccountScopedRoute =
  | `/accounts/${number}/settings`
  | `/accounts/${number}/members`;

export type AppRoute =
  | "/dashboard"
  | "/transactions"
  | "/budgets"
  | "/accounts/new"
  | AccountScopedRoute;

export const APP_ROUTES = {
  dashboard: "/dashboard" as const,
  transactions: "/transactions" as const,
  budgets: "/budgets" as const,
  accountCreate: "/accounts/new" as const,
  accountSettings: (accountId: number): AccountScopedRoute =>
    `/accounts/${accountId}/settings`,
  accountMembers: (accountId: number): AccountScopedRoute =>
    `/accounts/${accountId}/members`,
} as const;

export type AccountRouteMatch = {
  accountId: number;
  type: "settings" | "members";
};

export const matchAccountRoute = (
  path: string,
): AccountRouteMatch | null => {
  const membersMatch = path.match(/^\/accounts\/(\d+)\/members$/);
  if (membersMatch) {
    return {
      accountId: Number.parseInt(membersMatch[1], 10),
      type: "members",
    };
  }

  const settingsMatch = path.match(/^\/accounts\/(\d+)\/settings$/);
  if (settingsMatch) {
    return {
      accountId: Number.parseInt(settingsMatch[1], 10),
      type: "settings",
    };
  }

  return null;
};

export const isAccountScopedRoute = (
  route: AppRoute,
): route is AccountScopedRoute => route.startsWith("/accounts/");
