export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
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
  period: 'monthly' | 'weekly' | 'yearly';
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