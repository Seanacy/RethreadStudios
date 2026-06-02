"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface Season {
  id: string;
  title: string;
  description: string | null;
  color_palette: string[] | null;
  is_active: boolean;
  started_at: string;
  ended_at: string | null;
}

interface Collection {
  id: string;
  title: string;
  mission_statement: string | null;
  piece_count?: number;
}

export default function SeasonDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [season, setSeason] = useState<Season | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allPieces, setAllPieces] = useState<{ collection_id: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    async function load() {
      const { data: s } = await supabase.from("rs_seasons").select("*").eq("id", id).single();
      if (!s) { router.push("/studio"); return; }
      setSeason(s as Season);

      const { data: cols } = await supabase
        .from("rs_collections")
        .select("id, title, mission_statement")
        .eq("season_id", id)
        .order("created_at", { ascending: false });
      setCollections((cols || []) as Collection[]);

      const { data: pieces } = await supabase
        .from("rs_pieces")
        .select("collection_id")
        .eq("artist_id", user!.id);
      setAllPieces((pieces || []) as { collection_id: string | null }[]);

      setLoading(false);
    }
    load();
  }, [id, user, authLoading, router]);

  const endSeason = async () => {
    if (!season) return;
    await supabase.from("rs_seasons").update({ is_active: false, ended_at: new Date().toISOString() }).eq("id", season.id);
    setSeason({ ...season, is_active: false, ended_at: new Date().toISOString() });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="text-[#555]">Loading...</span>
      </div>
    );
  }

  if (!season) return null;

  const totalPieces = collections.reduce((sum, col) => {
    return sum + allPieces.filter((p) => p.collection_id === col.id).length;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <Link href="/studio" className="text-[#888] hover:text-white text-sm">← Studio</Link>

        {/* Season header */}
        <div className="flex items-center gap-3 mt-4 mb-2">
          {season.is_active && <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />}
          <h1 className="text-3xl font-bold text-white">{season.title}</h1>
        </div>

        <div className="flex gap-4 text-sm text-[#888] mb-6">
          <span>{season.is_active ? "Active" : "Ended"}</span>
          <span>Started {new Date(season.started_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          {season.ended_at && (
            <span>Ended {new Date(season.ended_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          )}
          <span>{collections.length} collections</span>
          <span>{totalPieces} pieces</span>
        </div>

        {/* Description */}
        {season.description && (
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 mb-8">
            <span className="text-xs text-[#e8d5b7] font-semibold tracking-wider uppercase block mb-3">About This Season</span>
            <p className="text-sm text-[#cccccc] leading-relaxed">{season.description}</p>
          </div>
        )}

        {/* Color palette */}
        {season.color_palette && season.color_palette.length > 0 && (
          <div className="mb-8">
            <span className="text-xs text-[#888] font-medium block mb-3">Color Palette</span>
            <div className="flex gap-3">
              {season.color_palette.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: color, border: "1px solid #333" }}
                  />
                  <span className="text-[10px] text-[#555]">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collections in this season */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Collections</h2>
          <Link
            href="/studio/new-collection"
            className="px-4 py-2 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0]"
          >
            + New Collection
          </Link>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-16 bg-[#141414] border border-[#1e1e1e] rounded-xl">
            <p className="text-3xl mb-3">📂</p>
            <p className="text-[#888]">No collections in this season yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {collections.map((col) => (
              <Link key={col.id} href={`/studio/collection/${col.id}`} className="group bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#e8d5b7]/30 transition-colors">
                <h3 className="text-lg font-bold text-white mb-1">{col.title}</h3>
                {col.mission_statement ? (
                  <p className="text-xs text-[#888] line-clamp-2 mb-3">{col.mission_statement}</p>
                ) : (
                  <p className="text-xs text-[#555] italic mb-3">No mission statement yet</p>
                )}
                <span className="text-[10px] text-[#e8d5b7]">
                  {allPieces.filter((p) => p.collection_id === col.id).length} pieces
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* End season button */}
        {season.is_active && (
          <div className="border-t border-[#1e1e1e] pt-8 mt-8">
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">End this season</h3>
                <p className="text-xs text-[#555]">When you're ready to move on. This season will be archived on your profile.</p>
              </div>
              <button
                onClick={endSeason}
                className="px-5 py-2 border border-[#333] text-[#888] text-sm rounded-lg hover:text-white hover:border-[#555] transition-colors"
              >
                End Season
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
