"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPieces: 0,
    available: 0,
    sold: 0,
    totalRevenue: 0,
    followers: 0,
    spottedPosts: 0,
    collections: 0,
    avgPrice: 0,
  });
  const [recentSales, setRecentSales] = useState<{ title: string; price: number; sold_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    async function load() {
      const { data: pieces } = await supabase.from("rs_pieces").select("title, price, status, updated_at").eq("artist_id", user!.id);
      const allPieces = pieces || [];
      const soldPieces = allPieces.filter((p) => p.status === "sold");
      const availablePieces = allPieces.filter((p) => p.status === "available");
      const totalRevenue = soldPieces.reduce((sum, p) => sum + (p.price || 0), 0);
      const avgPrice = allPieces.length > 0 ? allPieces.reduce((sum, p) => sum + (p.price || 0), 0) / allPieces.length : 0;

      const { count: followers } = await supabase.from("rs_follows").select("*", { count: "exact", head: true }).eq("artist_id", user!.id);
      const { count: spotted } = await supabase.from("rs_spotted").select("*", { count: "exact", head: true }).eq("artist_id", user!.id);
      const { count: collections } = await supabase.from("rs_collections").select("*", { count: "exact", head: true }).eq("artist_id", user!.id);

      setStats({
        totalPieces: allPieces.length,
        available: availablePieces.length,
        sold: soldPieces.length,
        totalRevenue,
        followers: followers || 0,
        spottedPosts: spotted || 0,
        collections: collections || 0,
        avgPrice: Math.round(avgPrice),
      });

      setRecentSales(
        soldPieces
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 10)
          .map((p) => ({ title: p.title, price: p.price, sold_at: p.updated_at }))
      );

      setLoading(false);
    }
    load();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><span className="text-[#555]">Loading...</span></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/studio" className="text-[#888] hover:text-white text-sm">← Studio</Link>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Revenue", value: `$${stats.totalRevenue}`, accent: true },
            { label: "Pieces Sold", value: stats.sold },
            { label: "Available", value: stats.available },
            { label: "Followers", value: stats.followers },
            { label: "Spotted Posts", value: stats.spottedPosts },
            { label: "Collections", value: stats.collections },
            { label: "Total Pieces", value: stats.totalPieces },
            { label: "Avg Price", value: `$${stats.avgPrice}` },
          ].map((s) => (
            <div key={s.label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${s.accent ? "text-[#e8d5b7]" : "text-white"}`}>{s.value}</div>
              <div className="text-xs text-[#888] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent sales */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
          <h2 className="text-sm font-bold text-white mb-4">Recent Sales</h2>
          {recentSales.length === 0 ? (
            <p className="text-xs text-[#555] text-center py-8">No sales yet. Keep creating!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentSales.map((sale, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                  <span className="text-sm text-[#cccccc]">{sale.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#e8d5b7]">${sale.price}</span>
                    <span className="text-[10px] text-[#555]">
                      {new Date(sale.sold_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
