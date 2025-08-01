export interface Transaction {
  categories: any;
  id: string;
  user_id: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  user_id: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: "monthly" | "weekly" | "yearly";
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  categoryBreakdown: {
    [categoryId: string]: {
      name: string;
      amount: number;
      percentage: number;
      color: string;
    };
  };
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  topCategories: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string; // 例: 三井住友銀行、現金、楽天証券
  type: string; // 例: 銀行, 現金, 証券, その他
  balance: number; // 現在の残高
  note?: string; // メモ
  created_at: string;
  updated_at: string;
}

export type NewTransaction = Omit<Transaction, "id" | "created_at" | "updated_at" | "categories"> & {
  category_id: string;
};
