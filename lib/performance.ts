// パフォーマンス監視用のユーティリティ

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();

  startTimer(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Timer "${name}" was not started`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // 開発環境でのみログ出力
    if (process.env.NODE_ENV === "development") {
      console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);
    }

    return metric.duration;
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clear(): void {
    this.metrics.clear();
  }
}

// グローバルインスタンス
export const performanceMonitor = new PerformanceMonitor();

// デコレータ風の関数（async関数用）
export function withPerformanceMonitoring<
  T extends (...args: any[]) => Promise<any>
>(name: string, fn: T): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    performanceMonitor.startTimer(name);
    try {
      const result = await fn(...args);
      return result;
    } finally {
      performanceMonitor.endTimer(name);
    }
  }) as T;
}

// データベースクエリ用のパフォーマンス監視
export function monitorDatabaseQuery<
  T extends (...args: any[]) => Promise<any>
>(queryName: string, fn: T): T {
  return withPerformanceMonitoring(`DB_${queryName}`, fn);
}

// ネットワークリクエスト用のパフォーマンス監視
export function monitorNetworkRequest<
  T extends (...args: any[]) => Promise<any>
>(requestName: string, fn: T): T {
  return withPerformanceMonitoring(`NET_${requestName}`, fn);
}

// パフォーマンス警告の設定
export const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY: 1000, // 1秒以上
  VERY_SLOW_QUERY: 3000, // 3秒以上
  SLOW_NETWORK: 2000, // 2秒以上
  VERY_SLOW_NETWORK: 5000, // 5秒以上
};

// パフォーマンス警告をチェック
export function checkPerformanceWarning(
  duration: number,
  type: "query" | "network"
): void {
  if (process.env.NODE_ENV !== "development") return;

  const thresholds =
    type === "query"
      ? {
          slow: PERFORMANCE_THRESHOLDS.SLOW_QUERY,
          verySlow: PERFORMANCE_THRESHOLDS.VERY_SLOW_QUERY,
        }
      : {
          slow: PERFORMANCE_THRESHOLDS.SLOW_NETWORK,
          verySlow: PERFORMANCE_THRESHOLDS.VERY_SLOW_NETWORK,
        };

  if (duration >= thresholds.verySlow) {
    console.warn(
      `🚨 非常に遅い${
        type === "query" ? "クエリ" : "ネットワークリクエスト"
      }: ${duration.toFixed(2)}ms`
    );
  } else if (duration >= thresholds.slow) {
    console.warn(
      `⚠️ 遅い${
        type === "query" ? "クエリ" : "ネットワークリクエスト"
      }: ${duration.toFixed(2)}ms`
    );
  }
}

// パフォーマンス統計の取得
export function getPerformanceStats(): {
  totalQueries: number;
  totalNetworkRequests: number;
  averageQueryTime: number;
  averageNetworkTime: number;
  slowQueries: PerformanceMetric[];
  slowNetworkRequests: PerformanceMetric[];
} {
  const metrics = performanceMonitor.getAllMetrics();

  const queries = metrics.filter((m) => m.name.startsWith("DB_"));
  const networkRequests = metrics.filter((m) => m.name.startsWith("NET_"));

  const slowQueries = queries.filter(
    (q) => q.duration && q.duration >= PERFORMANCE_THRESHOLDS.SLOW_QUERY
  );
  const slowNetworkRequests = networkRequests.filter(
    (n) => n.duration && n.duration >= PERFORMANCE_THRESHOLDS.SLOW_NETWORK
  );

  const averageQueryTime =
    queries.length > 0
      ? queries.reduce((sum, q) => sum + (q.duration || 0), 0) / queries.length
      : 0;

  const averageNetworkTime =
    networkRequests.length > 0
      ? networkRequests.reduce((sum, n) => sum + (n.duration || 0), 0) /
        networkRequests.length
      : 0;

  return {
    totalQueries: queries.length,
    totalNetworkRequests: networkRequests.length,
    averageQueryTime,
    averageNetworkTime,
    slowQueries,
    slowNetworkRequests,
  };
}
