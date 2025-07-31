'use client';

import { useState, useEffect } from 'react';
import { getTransactions } from '@/lib/database';
import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { useCache } from '@/hooks/use-cache';

interface TransactionListProps {
    userId: string;
    pageSize?: number;
}

export function TransactionList({ userId, pageSize = 20 }: TransactionListProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const {
        data: transactionData,
        loading,
        error,
        refetch
    } = useCache(
        `transactions_${userId}_${currentPage}_${pageSize}`,
        async () => {
            const offset = currentPage * pageSize;
            return await getTransactions(userId, pageSize, offset, {
                includeCategories: true,
                cache: true
            });
        },
        5 * 60 * 1000 // 5分間キャッシュ
    );

    const transactions = transactionData?.data || [];

    useEffect(() => {
        // データがページサイズより少ない場合、次のページがない
        setHasMore(transactions.length === pageSize);
    }, [transactions.length, pageSize]);

    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const formatAmount = (amount: number, type: 'income' | 'expense') => {
        const formatted = new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        }).format(amount);

        return (
            <span className={`font-semibold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {type === 'income' ? '+' : '-'}{formatted}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-red-600">エラーが発生しました: {error.message}</p>
                    <Button onClick={() => refetch()} className="mt-2">
                        再試行
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">最近の取引</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        前へ
                    </Button>
                    <span className="px-3 py-2 text-sm text-gray-600">
                        {currentPage + 1}ページ
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!hasMore}
                    >
                        次へ
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {transactions.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                        取引がありません
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {transactions.map((transaction: Transaction) => (
                        <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${transaction.type === 'income'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                            {transaction.type === 'income' ? (
                                                <Plus className="h-4 w-4" />
                                            ) : (
                                                <Minus className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{transaction.description}</p>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <span>{formatDate(transaction.date)}</span>
                                                {transaction.categories && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center space-x-1">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: transaction.categories.color }}
                                                            />
                                                            <span>{transaction.categories.name}</span>
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {formatAmount(transaction.amount, transaction.type)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 