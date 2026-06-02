"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface Collection {
  id: string;
  title: string;
  mission_statement: string | null;
  cover_image: string | null;
  mood_board: string[] | null;
  season_id: string | null;
  created_at: string;
}

interface Piece {
  id: string;
  title: string;
  price: number;
  status: string;
  after_images: string[];
  is_one_of_one: boolean;
  category: string;
  description: string;
  size: string;
  before_images: string[];
}

interface Season {
  id: string;
  title: string;
}

export default function CollectionDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMission, setEditingMission] = useState(false);
  const [missionDraft, setMissionDraft] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    async function load() {
      const { data: col } = await supabase
        .from("rs_collections")
        .select("*")
        .eq("id", id)
        .single();

      if (!col) { router.push("/studio"); return; }
      setCollection(col as Collection);
      setMissionDraft((col as Collection).mission_statement || "");

      if ((col as Collection).season_id) {
        const { data: s } = await supabase
          .from("rs_seasons")
          .select("id, title")
          .eq("id", (col as Collection).season_id)
          .single();
        if (s) setSeason(s as Season);
      }

      const { data: p } = await supabase
        .from("rs_pieces")
        .select("*")
        .eq("collection_id", id)
        .order("created_at", { ascending: false });

      setPieces((p || []) as Piece[]);
      setLoading(false);
    }
    load();
  }, [id, user, authLoading, router]);

  const saveMission = async () => {
    if (!collection) return;
    await supabase
      .from("rs_collections")
      .update({ mission_statement: missionDraft, updated_at: new Date().toISOString() })
      .eq("id", collection.id);
    setCollection({ ...collection, mission_statement: missionDraft });
    setEditingMission(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="text-[#555]">Loading...</span>
      </div>
    );
  }

  if (!collection) return null;

  const available = pieces.filter((p) => p.status === "available").length;
  const sold = pieces.filter((p) => p.status === "sold").length;
  const needsMission = pieces.length >= 3 && !collection.mission_statement;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/studio" className="text-[#888] hover:text-white text-sm">← Studio</Link>
          {season && (
            <span className="text-[10px] text-[#555] bg-[#141414] border border-[#1e1e1e] px-2 py-0.5 rounded-full">
              Season: {season.title}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{collection.title}</h1>

        <div className="flex gap-4 text-sm text-[#888] mb-6">
          <span>{pieces.length} pieces</span>
          <span>{available} available</span>
          <span>{sold} sold</span>
        </div>

        {/* Cover image */}
        {collection.cover_image && (
          <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8">
            <img src={collection.cover_image} alt={collection.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Mission statement */}
        <div className="mb-8">
          {needsMission && (
            <div className="bg-[#e8d5b7]/10 border border-[#e8d5b7]/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-[#e8d5b7] font-medium">
                This collection has {pieces.length} pieces — a mission statement is now required to add more.
              </p>
            </div>
          )}

          {editingMission ? (
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <label className="text-xs text-[#888] font-medium mb-2 block">Mission Statement</label>
              <textarea
                value={missionDraft}
                onChange={(e) => setMissionDraft(e.target.value)}
                rows={5}
                placeholder="What's the creative direction of this collection?"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={saveMission} className="px-5 py-2 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0]">
                  Save
                </button>
                <button onClick={() => setEditingMission(false)} className="px-5 py-2 text-[#888] text-sm hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          ) : collection.mission_statement ? (
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#e8d5b7] font-semibold tracking-wider uppercase">Mission Statement</span>
                <button onClick={() => setEditingMission(true)} className="text-xs text-[#555] hover:text-white">
                  Edit
                </button>
              </div>
              <p className="text-sm text-[#cccccc] leading-relaxed">{collection.mission_statement}</p>
            </div>
          ) : (
            <button
              onClick={() => setEditingMission(true)}
              className="w-full bg-[#141414] border border-dashed border-[#1e1e1e] rounded-xl p-5 text-center hover:border-[#e8d5b7]/30 transition-colors"
            >
              <span className="text-sm text-[#888]">+ Add Mission Statement</span>
            </button>
          )}
        </div>

        {/* Vision Mapping — Reference Images */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#e8d5b7] font-semibold tracking-wider uppercase">Vision Board</span>
          </div>
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
            <p className="text-xs text-[#888] mb-4">Upload reference images, mood photos, color swatches — anything that captures the creative direction of this collection. Buyers see this alongside your pieces.</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                const urls: string[] = [];
                for (const file of files) {
                  const path = `vision/${collection.id}/${Date.now()}-${file.name}`;
                  const { error } = await supabase.storage.from("rethread").upload(path, file);
                  if (!error) {
                    const { data } = supabase.storage.from("rethread").getPublicUrl(path);
                    urls.push(data.publicUrl);
                  }
                }
                if (urls.length > 0) {
                  const existing = (collection as unknown as Record<string, unknown>).mood_board as string[] || [];
                  const updated = [...existing, ...urls];
                  await supabase.from("rs_collections").update({ mood_board: updated }).eq("id", collection.id);
                  setCollection({ ...collection, mood_board: updated } as unknown as Collection);
                }
              }}
              className="w-full text-sm text-[#888] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1e1e1e] file:text-[#e8d5b7] hover:file:bg-[#252525] mb-4"
            />
            {(collection as unknown as Record<string, unknown>).mood_board && ((collection as unknown as Record<string, unknown>).mood_board as string[]).length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {((collection as unknown as Record<string, unknown>).mood_board as string[]).map((img, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#0a0a0a]">
                    <img src={img} alt={`Vision ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pieces */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Pieces</h2>
          <Link
            href="/studio/new-piece"
            className="px-4 py-2 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4c0a0]"
          >
            + Add Piece
          </Link>
        </div>

        {pieces.length === 0 ? (
          <div className="text-center py-16 bg-[#141414] border border-[#1e1e1e] rounded-xl">
            <p className="text-3xl mb-3">✂️</p>
            <p className="text-[#888]">No pieces in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pieces.map((piece) => (
              <div key={piece.id} className="group">
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
                  {piece.is_one_of_one && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#0a0a0a]/80 text-[#e8d5b7] text-[10px] font-semibold rounded-full backdrop-blur-sm">
                      1 of 1
                    </span>
                  )}
                </div>
                <h3 className="text-sm text-white truncate">{piece.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#e8d5b7]">${piece.price}</span>
                  <span className="text-[10px] text-[#555]">{piece.size}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
