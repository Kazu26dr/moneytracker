import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthGuard } from '@/components/auth/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MoneyTracker - 家計簿アプリ',
  description: 'あなたの家計を簡単に管理できる家計簿アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}