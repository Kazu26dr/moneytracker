'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Target, AlertTriangle } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const mockBudgets = [
  {
    id: '1',
    category: '食費',
    budgetAmount: 80000,
    spentAmount: 65000,
    color: '#EF4444',
    period: 'monthly'
  },
  {
    id: '2',
    category: '交通費',
    budgetAmount: 30000,
    spentAmount: 35000,
    color: '#F59E0B',
    period: 'monthly'
  },
  {
    id: '3',
    category: '娯楽費',
    budgetAmount: 50000,
    spentAmount: 25000,
    color: '#8B5CF6',
    period: 'monthly'
  },
  {
    id: '4',
    category: '光熱費',
    budgetAmount: 25000,
    spentAmount: 22000,
    color: '#3B82F6',
    period: 'monthly'
  }
];

export default function BudgetsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { status: 'over', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (percentage >= 80) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'good', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  };

  // 進捗バーの色を返す関数を追加
  const getProgressBarColor = (spent: number, budget: number) => {
    return spent > budget ? 'bg-red-500' : 'bg-blue-500';
  };

  const totalBudget = mockBudgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = mockBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="py-8 px-4 lg:px-8">
          <div className="space-y-8 p-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">予算管理</h1>
                <p className="text-gray-600 mt-2">カテゴリ別の予算を設定し、支出を管理します</p>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <PlusCircle className="h-4 w-4 mr-2" />
                予算を追加
              </Button>
            </div>

            {/* Overall Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  今月の予算概要
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalBudget)}
                    </div>
                    <div className="text-sm text-gray-500">総予算</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalSpent)}
                    </div>
                    <div className="text-sm text-gray-500">使用済み</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                      {formatCurrency(totalBudget - totalSpent)}
                    </div>
                    <div className="text-sm text-gray-500">残り予算</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress
                    value={getProgressPercentage(totalSpent, totalBudget)}
                    className="h-3"
                    barClassName={getProgressBarColor(totalSpent, totalBudget)}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{getProgressPercentage(totalSpent, totalBudget).toFixed(1)}% 使用</span>
                    <span>{(100 - getProgressPercentage(totalSpent, totalBudget)).toFixed(1)}% 残り</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockBudgets.map((budget) => {
                const progressPercentage = getProgressPercentage(budget.spentAmount, budget.budgetAmount);
                const status = getBudgetStatus(budget.spentAmount, budget.budgetAmount);

                return (
                  <Card key={budget.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: budget.color }}
                          />
                          <CardTitle className="text-lg">{budget.category}</CardTitle>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${status.color} ${status.bgColor}`}
                        >
                          {status.status === 'over' && (
                            <>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              予算超過
                            </>
                          )}
                          {status.status === 'warning' && '要注意'}
                          {status.status === 'good' && '順調'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">使用済み</span>
                        <span className="font-medium">
                          {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.budgetAmount)}
                        </span>
                      </div>

                      <Progress
                        value={progressPercentage}
                        className="h-2"
                        barClassName={getProgressBarColor(budget.spentAmount, budget.budgetAmount)}
                      />

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{progressPercentage.toFixed(1)}% 使用</span>
                        <span className={
                          budget.budgetAmount - budget.spentAmount >= 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }>
                          残り {formatCurrency(budget.budgetAmount - budget.spentAmount)}
                        </span>
                      </div>

                      {status.status === 'over' && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-red-800 text-sm">
                            予算を{formatCurrency(budget.spentAmount - budget.budgetAmount)}オーバーしています
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>注意:</strong> この画面はデモ版です。実際のアプリケーションでは、
                リアルタイムの取引データに基づいて予算の進捗が更新されます。
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}