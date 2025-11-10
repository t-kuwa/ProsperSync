export type CategoryType = "income" | "expense";

export type Category = {
  id: number;
  accountId: number;
  name: string;
  type: CategoryType;
  color: string | null;
  icon: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryPayload = {
  name: string;
  type: CategoryType;
  color?: string | null;
  icon?: string | null;
  position?: number;
};

export type UserSummary = {
  id: number;
  name: string;
  email: string;
};

export type Expense = {
  id: number;
  accountId: number;
  userId: number;
  categoryId: number;
  title: string;
  amount: number;
  spentOn: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  user?: UserSummary;
};

export type Income = {
  id: number;
  accountId: number;
  userId: number;
  categoryId: number;
  title: string;
  amount: number;
  receivedOn: string;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  user?: UserSummary;
};

export type TransactionType = "income" | "expense";

export type TransactionPayload = {
  type: TransactionType;
  title: string;
  amount: number;
  date: string;
  memo?: string;
  categoryId: number;
};

export type Transaction = {
  uid: string;
  resourceId: number;
  resourceType: TransactionType;
  title: string;
  amount: number;
  date: string;
  memo: string | null;
  category: Category;
  user?: UserSummary;
};

export type TransactionFilters = {
  type: TransactionType | "all";
  categoryId: number | null;
  startDate: string | null;
  endDate: string | null;
  month: string | null;
  search: string;
};

export type TransactionSortField = "date" | "amount" | "category";
export type TransactionSortDirection = "asc" | "desc";

export type TransactionSort = {
  field: TransactionSortField;
  direction: TransactionSortDirection;
};

export type PaginationState = {
  page: number;
  pageSize: number;
};

export type TransactionQueryParams = {
  startDate?: string;
  endDate?: string;
  month?: string;
  categoryId?: number;
};

export type ExpenseQueryParams = TransactionQueryParams;
export type IncomeQueryParams = TransactionQueryParams;
