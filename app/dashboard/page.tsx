'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getTransactions, getMonthlyStats, getAssets } from '@/lib/database';
import { getCurrentUser } from '@/lib/supabase';
import { Transaction } from '@/types';
import { Asset } from '@/types';
import { useCache } from '@/hooks/use-cache';

// トランザクションデータが有効かどうかをチェックする型ガード
function isValidTransaction(item: unknown): item is Transaction {
  return Boolean(
    item &&
    typeof item === 'object' &&
    item !== null &&
    !(item as any).error && // ParserErrorをチェック
    typeof (item as any).id === 'string' &&
    typeof (item as any).user_id === 'string' &&
    typeof (item as any).amount === 'number' &&
    ((item as any).type === 'income' || (item as any).type === 'expense') &&
    typeof (item as any).description === 'string' &&
    typeof (item as any).date === 'string' &&
    // categoriesはオプショナルなのでundefinedまたは有効なオブジェクトかチェック
    ((item as any).categories === null || (item as any).categories === undefined ||
      (typeof (item as any).categories === 'object' &&
        typeof (item as any).categories.id === 'string' &&
        typeof (item as any).categories.name === 'string' &&
        typeof (item as any).categories.color === 'string'))
  );
}

export default function DashboardPage() {
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsTotal, setAssetsTotal] = useState(0);
  const [userId, setUserId] = useState<string>('');
  const [userLoading, setUserLoading] = useState(true);

  // ユーザー情報の取得
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  // 取引データの取得（キャッシュ付き）
  const {
    data: transactionData,
    loading: transactionLoading,
    refetch: refetchTransactions
  } = useCache(
    `transactions_${userId}_dashboard`,
    async () => {
      if (!userId) return { data: [], error: null };
      return await getTransactions(userId, 10);
    },
    2 * 60 * 1000 // 2分間キャッシュ
  );

  // 新しい取引が追加された時にキャッシュを更新
  useEffect(() => {
    // カスタムイベントリスナーを追加
    const handleNewTransaction = () => {
      refetchTransactions();
    };

    window.addEventListener('newTransaction', handleNewTransaction);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('newTransaction', handleNewTransaction);
    };
  }, [refetchTransactions]);

  // データを安全にフィルタリング
  const rawTransactions = transactionData?.data || [];
  const transactions: Transaction[] = (rawTransactions as unknown[]).filter(isValidTransaction);

  // データにパースエラーが含まれている場合のログ出力
  useEffect(() => {
    if (rawTransactions.length > 0 && transactions.length !== rawTransactions.length) {
      console.warn(`Dashboard: Filtered out ${rawTransactions.length - transactions.length} invalid transactions`);
      console.warn('Invalid transactions:', rawTransactions.filter(item => !isValidTransaction(item as unknown)));
    }
  }, [rawTransactions, transactions]);

  // 統計データとその他のデータの取得
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) return;

      try {

        // Get current month stats
        const now = new Date();
        const monthlyStatsResult = await getMonthlyStats(userId, now.getFullYear(), now.getMonth() + 1);
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

        // 資産データ取得
        const assetsResult = await getAssets(userId);
        if (assetsResult?.data) {
          setAssets(assetsResult.data);
          setAssetsTotal(assetsResult.data.reduce((sum: number, a: Asset) => sum + (a.balance || 0), 0));
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [userId]);

  const loading = userLoading || transactionLoading;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-2">資産合計</h2>
          <div className="text-3xl font-bold text-emerald-600 mb-2">{assetsTotal.toLocaleString()} 円</div>
          <ul className="divide-y divide-gray-200">
            {assets.map((asset) => (
              <li key={asset.id} className="py-2 flex justify-between items-center">
                <span className="font-medium">{asset.name} <span className="text-xs text-gray-500 ml-2">({asset.type})</span></span>
                <span className="text-right">{asset.balance.toLocaleString()} 円</span>
              </li>
            ))}
          </ul>
        </div>
        <StatsCards
          totalIncome={stats.totalIncome}
          totalExpenses={stats.totalExpenses}
          netIncome={stats.netIncome}
          monthlyChange={stats.monthlyChange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseChart data={chartData} />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  );
}