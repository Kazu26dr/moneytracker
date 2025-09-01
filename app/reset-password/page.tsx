'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, DollarSign, CheckCircle } from 'lucide-react';
import { updatePassword } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // セッションの確認
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // URLパラメータからアクセストークンとリフレッシュトークンを取得
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // URLパラメータからセッションを設定
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (!error) {
            setIsValidSession(true);
          } else {
            setError('無効なリセットリンクです。再度パスワードリセットを行ってください。');
          }
        } else if (session) {
          setIsValidSession(true);
        } else {
          setError('無効なリセットリンクです。再度パスワードリセットを行ってください。');
        }
      } catch (error) {
        console.error('Session check error:', error);
        setError('セッションの確認中にエラーが発生しました。');
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // 3秒後にダッシュボードにリダイレクト
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Password update error:', error);
      setError('パスワードの更新中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">無効なリンク</CardTitle>
              <CardDescription className="text-gray-600">
                パスワードリセットリンクが無効または期限切れです
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              ログインページに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">パスワード更新完了</CardTitle>
              <CardDescription className="text-gray-600">
                パスワードが正常に更新されました
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-emerald-800">
                3秒後にダッシュボードにリダイレクトします...
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
            >
              今すぐダッシュボードへ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">新しいパスワード</CardTitle>
            <CardDescription className="text-gray-600">
              新しいパスワードを設定してください
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">新しいパスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
              <p className="text-xs text-gray-500">6文字以上で入力してください</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">パスワード確認</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? 'パスワード更新中...' : 'パスワードを更新'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}