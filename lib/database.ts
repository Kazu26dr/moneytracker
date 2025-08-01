import { supabase } from "./supabase";
import { Transaction, Category, Budget, Asset, NewTransaction } from "@/types";
import { monitorDatabaseQuery, checkPerformanceWarning } from "./performance";

// Transaction operations
export const getTransactions = monitorDatabaseQuery(
  "getTransactions",
  async (
    userId: string,
    limit?: number,
    offset?: number,
    options?: {
      includeCategories?: boolean;
      cache?: boolean;
    }
  ) => {
    if (!supabase) return;

    const { includeCategories = true, cache = true } = options || {};

    let query = supabase
      .from("transactions")
      .select(
        includeCategories
          ? `
            id,
            amount,
            description,
            date,
            type,
            user_id,
            category_id,
            created_at,
            updated_at,
            categories (
              id,
              name,
              color,
              icon
            )
          `
          : `
            id,
            amount,
            description,
            date,
            type,
            user_id,
            category_id,
            created_at,
            updated_at
          `
      )
      .eq("user_id", userId)
      .order("date", { ascending: false });

    // ページネーション
    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1);
    }

    // キャッシュはSupabaseのクエリビルダーでは直接サポートされていないため削除

    const { data, error } = await query;
    return { data, error };
  }
);

// トランザクション作成
export const createTransaction = async (
  transaction: NewTransaction
) => {
  if (!supabase) return;

  const { data, error } = await supabase
    .from("transactions")
    .insert([transaction])
    .select()
    .single();

  return { data, error };
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
) => {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
};

export const deleteTransaction = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  return { error };
};

// Category operations
export const getCategories = async (
  userId: string,
  type?: "income" | "expense"
) => {
  if (!supabase) return;
  let query = supabase
    .from("categories")
    .select("id, name, color, icon, type, user_id, created_at")
    .eq("user_id", userId)
    .order("name");

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createCategory = monitorDatabaseQuery(
  "createCategory",
  async (category: Omit<Category, "id" | "created_at">) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("categories")
      .insert([category])
      .select()
      .single();
    return { data, error };
  }
);

// Budget operations
export const getBudgets = async (userId: string) => {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("budgets")
    .select(
      `
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const createBudget = async (
  budget: Omit<Budget, "id" | "created_at">
) => {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("budgets")
    .insert([budget])
    .select()
    .single();
  return { data, error };
};

// Analytics
export const getMonthlyStats = async (
  userId: string,
  year: number,
  month: number
) => {
  if (!supabase) return;
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `
    )
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate);

  return { data, error };
};

// Asset operations
export const getAssets = async (userId: string) => {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const createAsset = async (
  asset: Omit<Asset, "id" | "created_at" | "updated_at">
) => {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("assets")
    .insert([asset])
    .select()
    .single();
  return { data, error };
};

export const updateAsset = async (id: string, updates: Partial<Asset>) => {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("assets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
};

export const deleteAsset = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from("assets").delete().eq("id", id);
  return { error };
};

// プロフィールがなければ作成する関数
export const createProfileIfNotExists = async (
  userId: string,
  fullName: string
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();
  if (!data) {
    // プロフィールがなければINSERT
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([{ id: userId, full_name: fullName }]);
    if (insertError) return { error: insertError };
  }
  return { error: null };
};
