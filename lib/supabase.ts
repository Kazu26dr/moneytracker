import { createClient } from "@supabase/supabase-js";

// 既存のsupabaseインスタンス生成部分を残し、重複importを削除
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// サインアップ関数: メール・パスワード・フルネームを受け取り、auth登録後にprofilesへもINSERT
export async function signUp(
  email: string,
  password: string,
  fullName: string
) {
  // ユーザー登録
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) return { error };

  // profilesへのINSERTは行わない
  return { error: null };
}

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase client not initialized" },
    };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    return { error: { message: "Supabase client not initialized" } };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!supabase) {
    return {
      user: null,
      error: { message: "Supabase client not initialized" },
    };
  }
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};
