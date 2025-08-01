'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { createCategory, getCategories } from '@/lib/database';
import { getCurrentUser } from '@/lib/supabase';
import { Category } from '@/types';
import { toast } from '@/hooks/use-toast';

const DEFAULT_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
];

const DEFAULT_CATEGORIES = {
  expense: [
    { name: '食費', color: '#EF4444', icon: '🍽️' },
    { name: '交通費', color: '#F97316', icon: '🚗' },
    { name: '住居費', color: '#84CC16', icon: '🏠' },
    { name: '光熱費', color: '#0EA5E9', icon: '💡' },
    { name: '医療費', color: '#EC4899', icon: '🏥' },
    { name: '娯楽費', color: '#8B5CF6', icon: '🎮' },
    { name: '衣服費', color: '#06B6D4', icon: '👔' },
    { name: 'その他', color: '#6B7280', icon: '📦' }
  ],
  income: [
    { name: '給与', color: '#22C55E', icon: '💼' },
    { name: 'ボーナス', color: '#10B981', icon: '💰' },
    { name: '副業', color: '#14B8A6', icon: '💻' },
    { name: '投資', color: '#3B82F6', icon: '📈' },
    { name: 'その他', color: '#6B7280', icon: '📦' }
  ]
};

const AVAILABLE_ICONS = [
  '🍽️', '🚗', '🏠', '💡', '🏥', '🎮', '👔', '📦',
  '💼', '💰', '💻', '📈', '🛒', '🎬', '📚', '✈️',
  '🏋️', '🎵', '📱', '🍕', '☕', '🎨', '🌟', '💳',
  '🎯', '🔧', '🎪', '🌸', '🎁', '🏆', '🔥', '⚡'
];

export default function CategoriesPage() {
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('📦');
  const [userId, setUserId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

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
      }
    };

    loadUser();
  }, []);

  // カテゴリの取得
  const [categoryLoading, setCategoryLoading] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!userId) return;

    setCategoryLoading(true);
    try {
      const result = await getCategories(userId);
      if (result?.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setCategoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const currentCategories = categories.filter(cat => cat.type === selectedType);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !userId) return;

    setIsAdding(true);
    try {
      const newCategory = {
        name: newCategoryName.trim(),
        type: selectedType,
        color: selectedColor,
        icon: selectedIcon,
        user_id: userId
      };

      const result = await createCategory(newCategory);

      if (result?.error) {
        toast({
          title: "エラー",
          description: "カテゴリの追加に失敗しました: " + result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "成功",
          description: "カテゴリを追加しました",
        });
        setNewCategoryName('');
        setSelectedIcon('📦');
        // カテゴリ一覧を再読み込み
        await loadCategories();
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "エラー",
        description: "カテゴリの追加に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="py-8 px-4 lg:px-8">
          <div className="space-y-8 p-2.5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">カテゴリ管理</h1>
              <p className="text-gray-600 mt-2">収入と支出のカテゴリを管理します</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add new category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    新しいカテゴリを追加
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>カテゴリタイプ</Label>
                    <RadioGroup
                      value={selectedType}
                      onValueChange={(value) => setSelectedType(value as 'income' | 'expense')}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="expense" id="expense-type" />
                        <Label htmlFor="expense-type" className="text-red-600 font-medium">
                          支出
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="income" id="income-type" />
                        <Label htmlFor="income-type" className="text-emerald-600 font-medium">
                          収入
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category-name">カテゴリ名</Label>
                    <Input
                      id="category-name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="例: 食費"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>カラー</Label>
                    <div className="grid grid-cols-8 gap-2">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                            }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>アイコン</Label>
                    <div className="grid grid-cols-8 gap-2">
                      {AVAILABLE_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          className={`w-8 h-8 rounded border-2 flex items-center justify-center text-lg hover:bg-gray-50 ${selectedIcon === icon ? 'border-gray-400 bg-gray-100' : 'border-gray-200'
                            }`}
                          onClick={() => setSelectedIcon(icon)}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      選択中: <span className="text-lg">{selectedIcon}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddCategory}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={!newCategoryName.trim() || isAdding}
                  >
                    {isAdding ? '追加中...' : 'カテゴリを追加'}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing categories */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedType === 'income' ? '収入' : '支出'}カテゴリ一覧
                    {categoryLoading && <span className="text-sm text-gray-500 ml-2">(読み込み中...)</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentCategories.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {categoryLoading ? 'カテゴリを読み込み中...' : 'カテゴリがありません'}
                      </div>
                    ) : (
                      currentCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="font-medium">{category.name}</span>
                            <span className="text-lg">{category.icon}</span>
                          </div>
                          <Badge
                            variant={selectedType === 'income' ? 'default' : 'secondary'}
                            className={
                              selectedType === 'income'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }
                          >
                            {selectedType === 'income' ? '収入' : '支出'}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}