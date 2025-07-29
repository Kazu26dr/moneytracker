'use client';

import { useEffect, useState } from 'react';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getCategories } from '@/lib/database';
import { getCurrentUser } from '@/lib/supabase';
import { Category } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';

export default function TransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) return;

        setUserId(user.id);

        const categoryData = await getCategories(user.id);
        if (categoryData && categoryData.data) {
          setCategories(categoryData.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="py-8 px-4 lg:px-8">
          <div className="space-y-8 p-2.5 flex flex-col justify-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">取引を追加</h1>
              <p className="text-gray-600 mt-2">新しい収入や支出を記録します</p>
            </div>

            <div className="w-full max-w-5xl">
              <TransactionForm
                categories={categories}
                userId={userId}
                onSuccess={() => {
                  // Redirect to dashboard or show success message
                  window.location.href = '/dashboard';
                }}
              />
            </div>

            {categories.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  カテゴリが見つかりません。まず
                  <a href="/categories" className="font-medium underline">
                    カテゴリページ
                  </a>
                  でカテゴリを作成してください。
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}