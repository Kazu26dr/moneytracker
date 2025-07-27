'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

const mockData = {
  monthlyTrends: [
    { month: '1月', income: 300000, expenses: 250000 },
    { month: '2月', income: 320000, expenses: 280000 },
    { month: '3月', income: 350000, expenses: 300000 },
    { month: '4月', income: 340000, expenses: 290000 },
    { month: '5月', income: 360000, expenses: 310000 },
    { month: '6月', income: 380000, expenses: 320000 },
  ],
  categoryBreakdown: [
    { name: '食費', value: 80000, color: '#EF4444' },
    { name: '住居費', value: 120000, color: '#F59E0B' },
    { name: '交通費', value: 30000, color: '#10B981' },
    { name: '光熱費', value: 25000, color: '#3B82F6' },
    { name: '娯楽費', value: 45000, color: '#8B5CF6' },
    { name: 'その他', value: 20000, color: '#EC4899' },
  ]
};

export default function ReportsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const totalExpenses = mockData.categoryBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">レポート</h1>
          <p className="text-gray-600 mt-2">詳細な分析と統計を確認できます</p>
        </div>
        <Select defaultValue="2024-06">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-06">2024年6月</SelectItem>
            <SelectItem value="2024-05">2024年5月</SelectItem>
            <SelectItem value="2024-04">2024年4月</SelectItem>
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
              {formatCurrency(380000)}
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
              {formatCurrency(totalExpenses)}
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
              {formatCurrency(380000 - totalExpenses)}
            </div>
            <p className="text-xs text-gray-500 mt-1">前月比 +8.7%</p>
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
                <BarChart data={mockData.monthlyTrends}>
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
                      data={mockData.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {mockData.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {mockData.categoryBreakdown.map((item, index) => (
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          <strong>注意:</strong> このレポートはデモデータを使用しています。
          実際のアプリケーションでは、あなたの取引データに基づいてリアルタイムで更新されます。
        </p>
      </div>
    </div>
  );
}