'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

interface StatsCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyChange: number;
}

export function StatsCards({
  totalIncome,
  totalExpenses,
  netIncome,
  monthlyChange
}: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const stats = [
    {
      title: '今月の収入',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: '今月の支出',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: '純利益',
      value: formatCurrency(netIncome),
      icon: DollarSign,
      color: netIncome >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: netIncome >= 0 ? 'bg-emerald-50' : 'bg-red-50'
    },
    {
      title: '前月比',
      value: `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}%`,
      icon: Wallet,
      color: monthlyChange >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: monthlyChange >= 0 ? 'bg-emerald-50' : 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}