'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getTransactions, getMonthlyStats } from '@/lib/database';
import { getCurrentUser } from '@/lib/supabase';
import { Transaction } from '@/types';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthlyChange: 0
  });
  const [chartData, setChartData] = useState<Array<{
    month: string;
    income: number;
    expenses: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) return;

        // Get recent transactions
        const transactionsResult = await getTransactions(user.id, 10);
        const transactionData = transactionsResult?.data;
        if (transactionData) {
          setTransactions(transactionData);
        }

        // Get current month stats
        const now = new Date();
        const monthlyStatsResult = await getMonthlyStats(user.id, now.getFullYear(), now.getMonth() + 1);
        const monthlyData = monthlyStatsResult?.data;

        if (monthlyData) {
          const income = monthlyData
            .filter((t: { type: string; amount: number }) => t.type === 'income')
            .reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0);

          const expenses = monthlyData
            .filter((t: { type: string; amount: number }) => t.type === 'expense')
            .reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0);

          setStats({
            totalIncome: income,
            totalExpenses: expenses,
            netIncome: income - expenses,
            monthlyChange: 5.2 // Mock data for now
          });
        }

        // Mock chart data (in real app, this would come from database)
        setChartData([
          { month: '1月', income: 300000, expenses: 250000 },
          { month: '2月', income: 320000, expenses: 280000 },
          { month: '3月', income: 350000, expenses: 300000 },
          { month: '4月', income: 340000, expenses: 290000 },
          { month: '5月', income: 360000, expenses: 310000 },
          { month: '6月', income: 380000, expenses: 320000 },
        ]);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2.5">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">あなたの家計の概要を確認できます</p>
      </div>

      <StatsCards
        totalIncome={stats.totalIncome}
        totalExpenses={stats.totalExpenses}
        netIncome={stats.netIncome}
        monthlyChange={stats.monthlyChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseChart data={chartData} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}