export type AppRoute = "/dashboard" | "/transactions";

export const APP_ROUTES: Record<
  "dashboard" | "transactions",
  AppRoute
> = {
  dashboard: "/dashboard",
  transactions: "/transactions",
};
