"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface Artist {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
}

interface Piece {
  id: string;
  title: string;
  price: number;
  status: string;
  after_images: string[];
  collection_id: string | null;
  created_at: string;
}

interface Collection {
  id: string;
  title: string;
  mission_statement: string | null;
  cover_image: string | null;
  piece_count?: number;
}

interface Season {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  started_at: string;
}

export default function StudioPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pieces" | "collections" | "seasons">("pieces");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    async function load() {
      const { data: a } = await supabase.from("rs_artists").select("*").eq("id", user!.id).single();
      if (!a) { router.push("/signup"); return; }
      setArtist(a as Artist);

      const { data: p } = await supabase.from("rs_pieces").select("*").eq("artist_id", user!.id).order("created_at", { ascending: false });
      setPieces((p || []) as Piece[]);

      const { data: c } = await supabase.from("rs_collections").select("*").eq("artist_id", user!.id).order("created_at", { ascending: false });
      setCollections((c || []) as Collection[]);

      const { data: s } = await supabase.from("rs_seasons").select("*").eq("artist_id", user!.id).order("started_at", { ascending: false });
      setSeasons((s || []) as Season[]);

      setLoading(false);
    }
    load();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="text-[#555]">Loading studio...</span>
      </div>
    );
  }

  const stats = {
    pieces: pieces.length,
    available: pieces.filter((p) => p.status === "available").length,
    sold: pieces.filter((p) => p.status === "sold").length,
    collections: collections.length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Artist header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[#e8d5b7] flex items-center justify-center text-[#0a0a0a] text-xl font-bold flex-shrink-0">
            {artist?.display_name?.[0]?.toUpperCase() || artist?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">
              {artist?.display_name || artist?.username}
            </h1>
            <p className="text-sm text-[#888]">@{artist?.username}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/studio/analytics"
              className="px-4 py-2 text-xs border border-[#1e1e1e] rounded-lg text-[#888] hover:text-white transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="/studio/settings"
              className="px-4 py-2 text-xs border border-[#1e1e1e] rounded-lg text-[#888] hover:text-white transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Pieces", value: stats.pieces },
            { label: "Available", value: stats.available },
            { label: "Sold", value: stats.sold },
            { label: "Collections", value: stats.collections },
          ].map((s) => (
            <div key={s.label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-[#888] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#1e1e1e]">
          {(["pieces", "collections", "seasons"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "text-[#e8d5b7] border-b-2 border-[#e8d5b7]"
                  : "text-[#888] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Pieces tab */}
        {tab === "pieces" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Your Pieces</h2>
              <Link
                href="/studio/new-piece"
                className="px-4 py-2 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors"
              >
                + New Piece
              </Link>
            </div>

            {pieces.length === 0 ? (
              <div className="text-center py-16 bg-[#141414] border border-[#1e1e1e] rounded-xl">
                <p className="text-3xl mb-3">✂️</p>
                <p className="text-[#888] mb-4">No pieces yet. List your first transformation.</p>
                <Link
                  href="/studio/new-piece"
                  className="inline-block px-6 py-2.5 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0]"
                >
                  Create Your First Piece
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {pieces.map((piece) => (
                  <Link key={piece.id} href={`/studio/piece/${piece.id}`} className="group">
                    <div className="aspect-[3/4] bg-[#141414] rounded-lg overflow-hidden mb-2 relative">
                      {piece.after_images?.[0] ? (
                        <img src={piece.after_images[0]} alt={piece.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#333]">No image</div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        piece.status === "available" ? "bg-green-500/20 text-green-400" :
                        piece.status === "sold" ? "bg-[#e8d5b7]/20 text-[#e8d5b7]" :
                        "bg-[#333]/80 text-[#888]"
                      }`}>
                        {piece.status}
                      </span>
                    </div>
                    <h3 className="text-sm text-white truncate">{piece.title}</h3>
                    <span className="text-xs text-[#e8d5b7]">${piece.price}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collections tab */}
        {tab === "collections" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Your Collections</h2>
              <Link
                href="/studio/new-collection"
                className="px-4 py-2 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors"
              >
                + New Collection
              </Link>
            </div>

            {collections.length === 0 ? (
              <div className="text-center py-16 bg-[#141414] border border-[#1e1e1e] rounded-xl">
                <p className="text-3xl mb-3">📂</p>
                <p className="text-[#888] mb-2">No collections yet.</p>
                <p className="text-xs text-[#555] mb-4">Group your pieces into a cohesive vision.</p>
                <Link
                  href="/studio/new-collection"
                  className="inline-block px-6 py-2.5 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0]"
                >
                  Start a Collection
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collections.map((col) => (
                  <Link key={col.id} href={`/studio/collection/${col.id}`} className="group bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#e8d5b7]/30 transition-colors">
                    <h3 className="text-lg font-bold text-white mb-1">{col.title}</h3>
                    {col.mission_statement ? (
                      <p className="text-xs text-[#888] line-clamp-2 mb-3">{col.mission_statement}</p>
                    ) : (
                      <p className="text-xs text-[#555] italic mb-3">No mission statement yet</p>
                    )}
                    <span className="text-[10px] text-[#e8d5b7]">
                      {pieces.filter((p) => p.collection_id === col.id).length} pieces
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seasons tab */}
        {tab === "seasons" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Your Seasons</h2>
              <Link
                href="/studio/new-season"
                className="px-4 py-2 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors"
              >
                + New Season
              </Link>
            </div>

            {seasons.length === 0 ? (
              <div className="text-center py-16 bg-[#141414] border border-[#1e1e1e] rounded-xl">
                <p className="text-3xl mb-3">🌱</p>
                <p className="text-[#888] mb-2">No seasons yet.</p>
                <p className="text-xs text-[#555] mb-4">A season is a chapter of your creative life. Start one when you're ready.</p>
                <Link
                  href="/studio/new-season"
                  className="inline-block px-6 py-2.5 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0]"
                >
                  Begin a Season
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {seasons.map((season) => (
                  <Link key={season.id} href={`/studio/season/${season.id}`} className="group bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 hover:border-[#e8d5b7]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      {season.is_active && (
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                      )}
                      <h3 className="text-lg font-bold text-white">{season.title}</h3>
                    </div>
                    {season.description && (
                      <p className="text-xs text-[#888] line-clamp-2 mb-2">{season.description}</p>
                    )}
                    <span className="text-[10px] text-[#555]">
                      Started {new Date(season.started_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
