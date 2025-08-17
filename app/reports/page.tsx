'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getTransactions, getMonthlyStats } from '@/lib/database';
import { getCurrentUser } from '@/lib/supabase';
import { useCache } from '@/hooks/use-cache';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function ReportsPage() {
  // 直近3ヶ月分の期間リストを生成
  const getRecentPeriods = () => {
    const now = new Date();
    const periods = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      periods.push({ value, label });
    }
    return periods;
  };
  const recentPeriods = getRecentPeriods();
  const [userId, setUserId] = useState<string>('');
  const [userLoading, setUserLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    monthlyChange: 0
  });
  const [monthlyTrends, setMonthlyTrends] = useState<Array<{
    month: string;
    income: number;
    expenses: number;
  }>>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<Array<{
    name: string;
    value: number;
    color: string;
  }>>([]);

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
    `reports_transactions_${userId}_${selectedPeriod}`,
    async () => {
      if (!userId) return { data: [], error: null };
      
      // 選択された期間の年月を取得
      const [year, month] = selectedPeriod.split('-').map(Number);
      return await getMonthlyStats(userId, year, month);
    },
    2 * 60 * 1000 // 2分間キャッシュ
  );

  // 新しい取引が追加された時にキャッシュを更新
  useEffect(() => {
    const handleNewTransaction = () => {
      refetchTransactions();
    };

    window.addEventListener('newTransaction', handleNewTransaction);
    
    return () => {
      window.removeEventListener('newTransaction', handleNewTransaction);
    };
  }, [refetchTransactions]);

  // データの処理
  useEffect(() => {
    if (!transactionData?.data) return;

    const transactions = transactionData.data;
    
    // 収入と支出の計算
    const income = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    
    const expenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

    setStats({
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      monthlyChange: 5.2 // 前月比は今回はモックデータ
    });

    // カテゴリ別支出の計算
    const categoryMap = new Map();
    transactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        if (t.categories) {
          const categoryName = t.categories.name;
          const categoryColor = t.categories.color;
          const currentAmount = categoryMap.get(categoryName) || { value: 0, color: categoryColor };
          categoryMap.set(categoryName, {
            value: currentAmount.value + Math.abs(t.amount),
            color: categoryColor
          });
        }
      });

    const categoryBreakdownData = Array.from(categoryMap.entries()).map(([name, data]: [string, any]) => ({
      name,
      value: data.value,
      color: data.color
    }));

    setCategoryBreakdown(categoryBreakdownData);

    // 月次推移データ（今月から直近6ヶ月分を動的生成）
    const getRecentMonthsData = (income: number, expenses: number) => {
      const now = new Date();
      const months = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = `${date.getMonth() + 1}月`;
        months.push({
          month: monthLabel,
          income: i === 0 ? income : 300000 + i * 20000,
          expenses: i === 0 ? expenses : 250000 + i * 20000,
        });
      }
      return months.reverse(); // 古い順→新しい順
    };
    setMonthlyTrends(getRecentMonthsData(income, expenses));
  }, [transactionData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const loading = userLoading || transactionLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-64">
          <main className="py-8 px-4 lg:px-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <LoadingSpinner />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalExpenses = categoryBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="py-8 px-4 lg:px-8">
          <div className="space-y-8 p-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">レポート</h1>
                <p className="text-gray-600 mt-2">詳細な分析と統計を確認できます</p>
              </div>
              <Select 
                value={selectedPeriod} 
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  {recentPeriods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    今月の収入
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(stats.totalIncome)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">前月比 +5.2%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    今月の支出
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(stats.totalExpenses)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">前月比 +3.1%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    純利益
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(stats.netIncome)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">前月比 {stats.monthlyChange >= 0 ? '+' : ''}{stats.monthlyChange.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>月次推移</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" className="text-sm" />
                        <YAxis
                          className="text-sm"
                          tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                        />
                        <Legend />
                        <Bar dataKey="income" fill="#10B981" name="収入" />
                        <Bar dataKey="expenses" fill="#EF4444" name="支出" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>カテゴリ別支出</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                      {categoryBreakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {categoryBreakdown.length === 0 && !loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  選択した期間にデータがありません。取引を追加すると、ここにレポートが表示されます。
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}