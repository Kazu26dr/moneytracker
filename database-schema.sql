-- カテゴリテーブルの作成
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  icon VARCHAR(10) NOT NULL DEFAULT '📦',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- RLS (Row Level Security) の有効化
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS ポリシーの作成
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type);

-- デフォルトカテゴリの挿入（オプション）
-- 注意: 実際のアプリケーションでは、ユーザー登録時にデフォルトカテゴリを作成することを推奨

-- 支出カテゴリのデフォルト
INSERT INTO categories (user_id, name, type, color, icon) VALUES
  ('00000000-0000-0000-0000-000000000000', '食費', 'expense', '#EF4444', '🍽️'),
  ('00000000-0000-0000-0000-000000000000', '交通費', 'expense', '#F97316', '🚗'),
  ('00000000-0000-0000-0000-000000000000', '住居費', 'expense', '#84CC16', '🏠'),
  ('00000000-0000-0000-0000-000000000000', '光熱費', 'expense', '#0EA5E9', '💡'),
  ('00000000-0000-0000-0000-000000000000', '医療費', 'expense', '#EC4899', '🏥'),
  ('00000000-0000-0000-0000-000000000000', '娯楽費', 'expense', '#8B5CF6', '🎮'),
  ('00000000-0000-0000-0000-000000000000', '衣服費', 'expense', '#06B6D4', '👔'),
  ('00000000-0000-0000-0000-000000000000', 'その他', 'expense', '#6B7280', '📦')
ON CONFLICT (user_id, name, type) DO NOTHING;

-- 収入カテゴリのデフォルト
INSERT INTO categories (user_id, name, type, color, icon) VALUES
  ('00000000-0000-0000-0000-000000000000', '給与', 'income', '#22C55E', '💼'),
  ('00000000-0000-0000-0000-000000000000', 'ボーナス', 'income', '#10B981', '💰'),
  ('00000000-0000-0000-0000-000000000000', '副業', 'income', '#14B8A6', '💻'),
  ('00000000-0000-0000-0000-000000000000', '投資', 'income', '#3B82F6', '📈'),
  ('00000000-0000-0000-0000-000000000000', 'その他', 'income', '#6B7280', '📦')
ON CONFLICT (user_id, name, type) DO NOTHING; 