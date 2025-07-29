"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAssets, createAsset, updateAsset, deleteAsset } from "@/lib/database";
import { Asset } from "@/types";
import { getCurrentUser } from "@/lib/supabase";

const ASSET_TYPES = ["銀行", "現金", "証券", "その他"];

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState("");
    const [form, setForm] = useState({
        name: "",
        type: ASSET_TYPES[0],
        balance: "",
        note: "",
    });
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { user } = await getCurrentUser();
            if (!user) return;
            setUserId(user.id);
            const { data } = await getAssets(user.id);
            setAssets(data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.balance) return;
        const assetData = {
            user_id: userId,
            name: form.name,
            type: form.type,
            balance: Number(form.balance),
            note: form.note,
        };
        if (editId) {
            await updateAsset(editId, assetData);
        } else {
            await createAsset(assetData);
        }
        const { data } = await getAssets(userId);
        setAssets(data || []);
        setForm({ name: "", type: ASSET_TYPES[0], balance: "", note: "" });
        setEditId(null);
    };

    const handleEdit = (asset: Asset) => {
        setEditId(asset.id);
        setForm({
            name: asset.name,
            type: asset.type,
            balance: asset.balance.toString(),
            note: asset.note || "",
        });
    };

    const handleDelete = async (id: string) => {
        await deleteAsset(id);
        const { data } = await getAssets(userId);
        setAssets(data || []);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="lg:ml-64">
                <main className="py-8 px-4 lg:px-8">
                    <div className="space-y-8 p-2.5">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">資産管理</h1>
                            <p className="text-gray-600 mt-2">あなたの資産（口座・現金など）を登録・管理できます</p>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{editId ? "資産を編集" : "新しい資産を追加"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={handleSubmit}>
                                    <div>
                                        <Label htmlFor="name">資産名</Label>
                                        <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="例: 三井住友銀行" />
                                    </div>
                                    <div>
                                        <Label htmlFor="type">種類</Label>
                                        <select id="type" name="type" value={form.type} onChange={handleChange} className="w-full border rounded h-10 px-2">
                                            {ASSET_TYPES.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="balance">残高</Label>
                                        <Input id="balance" name="balance" type="number" value={form.balance} onChange={handleChange} required placeholder="例: 100000" />
                                    </div>
                                    <div>
                                        <Label htmlFor="note">メモ</Label>
                                        <Input id="note" name="note" value={form.note} onChange={handleChange} placeholder="任意" />
                                    </div>
                                    <div className="md:col-span-4 flex gap-2 mt-2">
                                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                                            {editId ? "更新" : "追加"}
                                        </Button>
                                        {editId && (
                                            <Button type="button" variant="outline" onClick={() => { setEditId(null); setForm({ name: "", type: ASSET_TYPES[0], balance: "", note: "" }); }}>
                                                キャンセル
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>資産一覧</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div>読み込み中...</div>
                                ) : assets.length === 0 ? (
                                    <div className="text-gray-500">資産が登録されていません</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="px-2 py-1 text-left">資産名</th>
                                                    <th className="px-2 py-1 text-left">種類</th>
                                                    <th className="px-2 py-1 text-right">残高</th>
                                                    <th className="px-2 py-1 text-left">メモ</th>
                                                    <th className="px-2 py-1">操作</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assets.map((asset) => (
                                                    <tr key={asset.id} className="border-b">
                                                        <td className="px-2 py-1">{asset.name}</td>
                                                        <td className="px-2 py-1">{asset.type}</td>
                                                        <td className="px-2 py-1 text-right">{asset.balance.toLocaleString()} 円</td>
                                                        <td className="px-2 py-1">{asset.note}</td>
                                                        <td className="px-2 py-1 flex gap-2">
                                                            <Button size="sm" variant="outline" onClick={() => handleEdit(asset)}>編集</Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(asset.id)}>削除</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
} 