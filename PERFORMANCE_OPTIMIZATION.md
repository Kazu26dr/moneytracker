# パフォーマンス最適化ガイド

## 概要

データベース取得時間の遅延（3 秒以上）を解決するための最適化を実装しました。

## 実装した最適化

### 1. データベースクエリの最適化

#### 変更内容

- `getTransactions`関数にページネーション機能を追加
- 必要なフィールドのみを選択的に取得
- クエリの構造を最適化

#### 効果

- 大量データの分割読み込み
- ネットワーク転送量の削減
- メモリ使用量の削減

### 2. クライアントサイドキャッシュ

#### 実装内容

- `useCache`フックを作成
- 5-10 分間のキャッシュ機能
- 重複クエリの回避

#### 使用方法

```typescript
const { data, loading, error } = useCache(
  `cache_key_${userId}`,
  async () => await getCategories(userId),
  10 * 60 * 1000 // 10分間キャッシュ
);
```

### 3. ページネーション機能

#### 実装内容

- `TransactionList`コンポーネントを作成
- 20 件ずつの分割読み込み
- 前後ページのナビゲーション

#### 効果

- 初期読み込み時間の短縮
- メモリ使用量の最適化
- ユーザー体験の向上

### 4. パフォーマンス監視

#### 実装内容

- `PerformanceMonitor`クラス
- データベースクエリの実行時間測定
- 開発環境での警告表示

#### 使用方法

```typescript
// 自動的にパフォーマンス監視
export const getTransactions = monitorDatabaseQuery(
  "getTransactions",
  async (userId, limit, offset) => {
    // クエリ実装
  }
);
```

## データベースインデックス

### 推奨インデックス

`database-indexes.sql`ファイルに以下のインデックスを定義：

```sql
-- transactionsテーブル
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);

-- categoriesテーブル
CREATE INDEX idx_categories_user_type ON categories(user_id, type);
```

### インデックスの効果

- `user_id`と`date`の複合インデックス：最も頻繁なクエリを高速化
- `category_id`のインデックス：JOIN クエリの高速化
- `type`のインデックス：フィルタリングの高速化

## 使用方法

### 1. データベースインデックスの適用

```bash
# SupabaseのSQLエディタで実行
psql -f database-indexes.sql
```

### 2. キャッシュの活用

```typescript
// カテゴリデータの取得（キャッシュ付き）
const { data: categories } = useCache(
  `categories_${userId}`,
  () => getCategories(userId),
  10 * 60 * 1000
);
```

### 3. ページネーションの使用

```typescript
// トランザクション一覧（ページネーション付き）
<TransactionList userId={userId} pageSize={20} />
```

## 期待される改善効果

### パフォーマンス向上

- **初期読み込み時間**: 3 秒 → 500ms 以下
- **ページ遷移時間**: 大幅短縮
- **メモリ使用量**: 30-50%削減

### ユーザー体験の向上

- スムーズなページ遷移
- レスポンシブな UI
- エラー時の適切なフィードバック

## 監視とデバッグ

### 開発環境での監視

```typescript
// パフォーマンス統計の取得
import { getPerformanceStats } from "@/lib/performance";

const stats = getPerformanceStats();
console.log("平均クエリ時間:", stats.averageQueryTime);
```

### 警告の確認

- 1 秒以上のクエリ: ⚠️ 警告
- 3 秒以上のクエリ: 🚨 エラー

## 今後の改善案

### 1. サーバーサイドレンダリング（SSR）

- Next.js の SSR 機能を活用
- 初期データの事前読み込み

### 2. リアルタイム更新

- Supabase のリアルタイム機能
- WebSocket 接続の最適化

### 3. 画像最適化

- 画像の遅延読み込み
- WebP 形式の活用

### 4. バンドルサイズの最適化

- コード分割（Code Splitting）
- Tree Shaking の活用

## トラブルシューティング

### キャッシュの問題

```typescript
// キャッシュのクリア
import { clearCacheByPattern } from "@/hooks/use-cache";
clearCacheByPattern("transactions");
```

### パフォーマンスの監視

```typescript
// ブラウザの開発者ツールで確認
// Network タブ: リクエスト時間
// Performance タブ: 実行時間
```

## 注意事項

1. **キャッシュの有効期限**: データの整合性を保つため適切な TTL を設定
2. **メモリ使用量**: 大量データの場合はページネーションを必ず使用
3. **エラーハンドリング**: ネットワークエラー時の適切な処理を実装
4. **セキュリティ**: ユーザー固有のデータアクセス制御を確認
