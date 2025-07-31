import { useState, useEffect, useCallback } from "react";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface Cache {
  [key: string]: CacheItem<any>;
}

const cache: Cache = {};

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // デフォルト5分
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCachedData = useCallback(() => {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }, [key]);

  const setCachedData = useCallback(
    (newData: T) => {
      cache[key] = {
        data: newData,
        timestamp: Date.now(),
        ttl,
      };
    },
    [key, ttl]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      const result = await fetcher();
      setData(result);
      setCachedData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetcher, getCachedData, setCachedData]);

  const invalidateCache = useCallback(() => {
    delete cache[key];
  }, [key]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache,
  };
}

// キャッシュ全体をクリアする関数
export const clearAllCache = () => {
  Object.keys(cache).forEach((key) => delete cache[key]);
};

// 特定のパターンにマッチするキャッシュをクリアする関数
export const clearCacheByPattern = (pattern: string) => {
  Object.keys(cache).forEach((key) => {
    if (key.includes(pattern)) {
      delete cache[key];
    }
  });
};
