'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Transaction, Category } from '@/types';
import { createTransaction } from '@/lib/database';
import { clearCacheByPattern } from '@/hooks/use-cache';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('金額は正の数である必要があります'),
  category_id: z.string().min(1, 'カテゴリを選択してください'),
  description: z.string().min(1, '説明を入力してください'),
  date: z.date()
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  categories: Category[];
  userId: string;
  onSuccess?: () => void;
}

export function TransactionForm({ categories, userId, onSuccess }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date()
    }
  });

  const transactionType = watch('type');
  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    try {
      const transactionData = {
        ...data,
        user_id: userId,
        date: data.date.toISOString(),
        amount: transactionType === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount)
      };

      const result = await createTransaction(transactionData);
      const error = result?.error;

      if (error) {
        console.error('Transaction creation error:', error);
        return;
      }

      // キャッシュをクリアしてダッシュボードの更新を促す
      clearCacheByPattern('transactions');
      clearCacheByPattern('monthly_stats');

      reset();
      setSelectedDate(new Date());
      onSuccess?.();
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しい取引を追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <Label>取引タイプ</Label>
            <RadioGroup
              value={transactionType}
              onValueChange={(value) => setValue('type', value as 'income' | 'expense')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 font-medium">支出</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-emerald-600 font-medium">収入</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">金額 (円)</Label>
            <Input
              id="amount"
              type="number"
              step="1"
              min="0"
              placeholder="1000"
              {...register('amount', { valueAsNumber: true })}
              className="text-right"
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>カテゴリ</Label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
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
            {errors.category_id && (
              <p className="text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              placeholder="取引の詳細を入力..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>日付</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ja })
                  ) : (
                    <span>日付を選択</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setValue('date', date);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '取引を保存'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}