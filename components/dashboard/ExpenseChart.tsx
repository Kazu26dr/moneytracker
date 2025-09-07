"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import React, { useEffect, useState } from "react";
import { getAssets } from "@/lib/database";
import { getCurrentUser } from "@/lib/supabase";
import { Asset } from "@/types";
interface ExpenseChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  initialAsset?: number;
}

export function ExpenseChart({ data, initialAsset = 0 }: ExpenseChartProps) {
  const [period, setPeriod] = useState<"6m" | "12m">("6m");
  const [userId, setUserId] = useState<string>("");
  const [assetsTotal, setAssetsTotal] = useState(0);

  // 現在月（日本語表記: "7月" など）
  const now = new Date();
  const currentMonthLabel = `${now.getMonth() + 1}月`;

  // 現在月基準で直近Nヶ月のラベルを生成し、存在しない月は0で埋める
  const generateTimelineData = (months: number) => {
    const labels: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${d.getMonth() + 1}月`);
    }
    return labels.map((label) => {
      const found = data.find((item) => item.month === label);
      return (
        found || {
          month: label,
          income: 0,
          expenses: 0,
        }
      );
    });
  };

  const displayData =
    period === "6m" ? generateTimelineData(6) : generateTimelineData(12);

  // 総資産は現在の資産残高を各月に表示
  const assetData = displayData.map((item) => ({
    ...item,
    asset: assetsTotal,
  }));

  // ユーザー情報の取得
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user } = await getCurrentUser();
        if (user?.id) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) return;

      try {
        // 資産データ取得（先に取得）
        const assetsResult = await getAssets(userId);
        let assetsTotalForChart = 0;
        if (assetsResult?.data) {
          assetsTotalForChart = assetsResult.data.reduce(
            (sum: number, a: Asset) => sum + (a.balance || 0),
            0
          );
          setAssetsTotal(assetsTotalForChart);
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    if (userId) {
      loadDashboardData();
    }
  }, [userId, period]);

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0]?.payload;
      return (
        <div className="bg-white p-3 rounded shadow text-xs border border-gray-200">
          <div>
            <span className="font-semibold">{label}</span>
          </div>
          <div>
            総資産:{" "}
            <span className="font-bold text-blue-600">
              ¥{assetsTotal.toLocaleString()}
            </span>
          </div>
          <div>
            収入:{" "}
            <span className="text-green-600">¥{d.income.toLocaleString()}</span>
          </div>
          <div>
            支出:{" "}
            <span className="text-red-600">¥{d.expenses.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            総資産推移（収入・支出内訳）
          </CardTitle>
          <div className="space-x-2">
            <button
              className={`px-3 py-1 rounded border text-sm ${
                period === "6m"
                  ? "bg-blue-100 border-blue-400 text-blue-700"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
              onClick={() => setPeriod("6m")}
            >
              6か月
            </button>
            <button
              className={`px-3 py-1 rounded border text-sm ${
                period === "12m"
                  ? "bg-blue-100 border-blue-400 text-blue-700"
                  : "bg-white border-gray-300 text-gray-600"
              }`}
              onClick={() => setPeriod("12m")}
            >
              1年
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={assetData}
              margin={{ top: 10, right: 30, left: 60, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                className="text-sm text-gray-500"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-sm text-gray-500"
                tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* 総資産の推移（折れ線） */}
              <Area
                type="monotone"
                dataKey="asset"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                name="総資産"
                dot={{ r: 2 }}
                activeDot={{
                  r: 6,
                  stroke: "#2563EB",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
              {/* 収入（棒グラフ） */}
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                name="収入"
              />
              {/* 支出（棒グラフ） */}
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
                name="支出"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
