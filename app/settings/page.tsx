'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, Download, Trash2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { getCurrentUser } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          setUserProfile({
            name: user.user_metadata?.full_name || '',
            email: user.email || ''
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    // TODO: プロフィール更新のロジックを実装
    // 現在はSupabaseのauth.updateUser()を使用してメタデータを更新する必要があります
    
    setTimeout(() => {
      setUpdating(false);
      // 成功メッセージを表示（実装時にtoastなどを使用）
    }, 1000);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="py-8 px-4 lg:px-8">
          <div className="space-y-8 p-2.5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">設定</h1>
              <p className="text-gray-600 mt-2">アカウントとアプリケーションの設定を管理します</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    プロフィール
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">お名前</Label>
                      <Input 
                        id="name" 
                        value={userProfile.name}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="お名前を入力してください"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={userProfile.email}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="メールアドレスを入力してください"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={updating}
                    >
                      {updating ? 'プロフィールを更新中...' : 'プロフィールを更新'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    通知設定
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>予算アラート</Label>
                      <div className="text-sm text-gray-500">
                        予算の80%に達した時に通知
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>月次レポート</Label>
                      <div className="text-sm text-gray-500">
                        毎月末にレポートをメール送信
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>取引リマインダー</Label>
                      <div className="text-sm text-gray-500">
                        定期的な取引の入力を促す通知
                      </div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    セキュリティ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">現在のパスワード</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">新しいパスワード</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">パスワード確認</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button variant="outline" className="w-full">
                    パスワードを変更
                  </Button>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    データ管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">データのエクスポート</h4>
                    <p className="text-sm text-gray-500">
                      すべての取引データをCSV形式でダウンロードできます
                    </p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      データをエクスポート
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">危険な操作</h4>
                    <p className="text-sm text-gray-500">
                      アカウントを削除すると、すべてのデータが完全に削除されます
                    </p>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      アカウントを削除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">アプリケーション情報</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>MoneyTracker バージョン 1.0.0</p>
                <p>最終更新: 2024年6月</p>
                <p>サポート: support@moneytracker.jp</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}