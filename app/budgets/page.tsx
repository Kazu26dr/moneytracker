'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Target, AlertTriangle } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { getBudgets, createBudget, getCategories } from '@/lib/database';
import { getCurrentUser } from '@/lib/supabase';
import { Budget, Category } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category_id: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly'
  });

  // ユーザー情報とデータの取得
  useEffect(() => {
    const loadData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) return;
        
        setUserId(user.id);
        
        // 予算とカテゴリを並行して取得
        const [budgetsResult, categoriesResult] = await Promise.all([
          getBudgets(user.id),
          getCategories(user.id, 'expense') // 支出カテゴリのみ
        ]);
        
        setBudgets(budgetsResult?.data || []);
        setCategories(categoriesResult?.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setBudgetForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.category_id || !budgetForm.amount || !userId) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const budgetData = {
        user_id: userId,
        category_id: budgetForm.category_id,
        amount: Number(budgetForm.amount),
        period: budgetForm.period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      };

      const result = await createBudget(budgetData);
      
      if (result?.error) {
        console.error('Budget creation error:', result.error);
        return;
      }

      // 予算一覧を再取得
      const budgetsResult = await getBudgets(userId);
      setBudgets(budgetsResult?.data || []);
      
      // フォームをリセットしてダイアログを閉じる
      setBudgetForm({ category_id: '', amount: '', period: 'monthly' });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // モックデータを実際のデータに置き換える準備（今回は基本構造のみ）
  const mockBudgets = budgets.length > 0 ? budgets.map(budget => ({
    id: budget.id,
    category: budget.categories?.name || 'カテゴリ不明',
    budgetAmount: budget.amount,
    spentAmount: 0, // TODO: 実際の支出額を計算
    color: budget.categories?.color || '#6B7280',
    period: budget.period
  })) : [];

  const totalBudget = mockBudgets.reduce((sum, budget) => sum + budget.budgetAmount, 0);
  const totalSpent = mockBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:ml-64">
          <main className="py-8 px-4 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    予算を追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>新しい予算を追加</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">カテゴリ</Label>
                      <Select 
                        value={budgetForm.category_id} 
                        onValueChange={(value) => handleFormChange('category_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">予算金額 (円)</Label>
                      <Input
                        id="amount"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="50000"
                        value={budgetForm.amount}
                        onChange={(e) => handleFormChange('amount', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="period">期間</Label>
                      <Select 
                        value={budgetForm.period} 
                        onValueChange={(value) => handleFormChange('period', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">週間</SelectItem>
                          <SelectItem value="monthly">月間</SelectItem>
                          <SelectItem value="yearly">年間</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        キャンセル
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        disabled={isSubmitting || !budgetForm.category_id || !budgetForm.amount}
                      >
                        {isSubmitting ? '追加中...' : '予算を追加'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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

            {mockBudgets.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  予算が設定されていません。「予算を追加」ボタンから新しい予算を設定してください。
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}