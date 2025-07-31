-- パフォーマンス向上のためのインデックス作成スクリプト

-- transactionsテーブルのインデックス
-- user_idとdateの複合インデックス（最も頻繁に使用されるクエリ）
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON transactions(user_id, date DESC);

-- user_idとcategory_idのインデックス
CREATE INDEX IF NOT EXISTS idx_transactions_user_category 
ON transactions(user_id, category_id);

-- dateのインデックス（月次統計用）
CREATE INDEX IF NOT EXISTS idx_transactions_date 
ON transactions(date);

-- typeのインデックス（収入/支出フィルタリング用）
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON transactions(type);

-- categoriesテーブルのインデックス
-- user_idとtypeの複合インデックス
CREATE INDEX IF NOT EXISTS idx_categories_user_type 
ON categories(user_id, type);

-- nameのインデックス（ソート用）
CREATE INDEX IF NOT EXISTS idx_categories_name 
ON categories(name);

-- budgetsテーブルのインデックス
-- user_idのインデックス
CREATE INDEX IF NOT EXISTS idx_budgets_user 
ON budgets(user_id);

-- assetsテーブルのインデックス
-- user_idのインデックス
CREATE INDEX IF NOT EXISTS idx_assets_user 
ON assets(user_id);

-- profilesテーブルのインデックス
-- idのインデックス（主キーなので通常は不要だが、念のため）
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles(id);

-- 統計情報の更新（PostgreSQLの場合）
ANALYZE transactions;
ANALYZE categories;
ANALYZE budgets;
ANALYZE assets;
ANALYZE profiles; 