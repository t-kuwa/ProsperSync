export type FinancialEntry = {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  note?: string;
};
