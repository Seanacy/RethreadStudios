"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

interface Piece {
  id: string;
  title: string;
  description: string;
  price: number;
  size: string;
  category: string;
  is_one_of_one: boolean;
  quantity: number;
  status: string;
  before_images: string[];
  after_images: string[];
  transformation_video: string;
  collection_id: string | null;
  artist_id: string;
  created_at: string;
}

interface Artist {
  username: string;
  display_name: string;
}

interface Collection {
  id: string;
  title: string;
}

export default function PieceDetailPage() {
  const { id } = useParams();
  const [piece, setPiece] = useState<Piece | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showBefore, setShowBefore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from("rs_pieces").select("*").eq("id", id).single();
      if (!p) { setLoading(false); return; }
      setPiece(p as Piece);

      const { data: a } = await supabase.from("rs_artists").select("username, display_name").eq("id", (p as Piece).artist_id).single();
      if (a) setArtist(a as Artist);

      if ((p as Piece).collection_id) {
        const { data: c } = await supabase.from("rs_collections").select("id, title").eq("id", (p as Piece).collection_id).single();
        if (c) setCollection(c as Collection);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><span className="text-[#555]">Loading...</span></div>;
  }

  if (!piece) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="pt-20 text-center py-32"><p className="text-2xl text-[#555]">Piece not found</p></div>
      </div>
    );
  }

  const images = showBefore ? (piece.before_images || []) : (piece.after_images || []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-[#141414] rounded-xl overflow-hidden mb-3">
              {images[activeImage] ? (
                <img src={images[activeImage]} alt={piece.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#333]">No image</div>
              )}
            </div>

            {/* Image thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? "border-[#e8d5b7]" : "border-transparent"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Before/After toggle */}
            {piece.before_images && piece.before_images.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => { setShowBefore(false); setActiveImage(0); }} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${!showBefore ? "bg-[#e8d5b7] text-[#0a0a0a]" : "bg-[#141414] text-[#888] border border-[#1e1e1e]"}`}>
                  After
                </button>
                <button onClick={() => { setShowBefore(true); setActiveImage(0); }} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${showBefore ? "bg-[#e8d5b7] text-[#0a0a0a]" : "bg-[#141414] text-[#888] border border-[#1e1e1e]"}`}>
                  Before (Thrift Find)
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {/* Artist */}
            {artist && (
              <Link href={`/artist/${artist.username}`} className="flex items-center gap-2 mb-4 group">
                <div className="w-8 h-8 rounded-full bg-[#e8d5b7] flex items-center justify-center text-[#0a0a0a] text-xs font-bold">
                  {artist.display_name?.[0]?.toUpperCase() || artist.username[0].toUpperCase()}
                </div>
                <span className="text-sm text-[#888] group-hover:text-[#e8d5b7] transition-colors">
                  {artist.display_name || artist.username}
                </span>
              </Link>
            )}

            <h1 className="text-3xl font-bold text-white mb-2">{piece.title}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-[#e8d5b7]">${piece.price}</span>
              {piece.is_one_of_one && (
                <span className="px-2 py-0.5 bg-[#e8d5b7]/10 text-[#e8d5b7] text-xs font-semibold rounded-full border border-[#e8d5b7]/20">
                  1 of 1
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                piece.status === "available" ? "bg-green-500/20 text-green-400" : "bg-[#333] text-[#888]"
              }`}>
                {piece.status}
              </span>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 mb-6">
              {piece.size && (
                <span className="px-3 py-1 bg-[#141414] border border-[#1e1e1e] rounded-lg text-xs text-[#888]">
                  Size: {piece.size}
                </span>
              )}
              {piece.category && (
                <span className="px-3 py-1 bg-[#141414] border border-[#1e1e1e] rounded-lg text-xs text-[#888]">
                  {piece.category}
                </span>
              )}
              {collection && (
                <span className="px-3 py-1 bg-[#141414] border border-[#1e1e1e] rounded-lg text-xs text-[#e8d5b7]">
                  {collection.title}
                </span>
              )}
            </div>

            {/* Description */}
            {piece.description && (
              <div className="mb-8">
                <h3 className="text-xs text-[#888] font-semibold uppercase tracking-wider mb-2">The Story</h3>
                <p className="text-sm text-[#cccccc] leading-relaxed whitespace-pre-line">{piece.description}</p>
              </div>
            )}

            {/* Buy button */}
            {piece.status === "available" ? (
              <button className="w-full py-3.5 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors text-sm mb-4">
                Purchase — ${piece.price}
              </button>
            ) : (
              <div className="w-full py-3.5 bg-[#141414] text-[#555] font-semibold rounded-lg text-center text-sm mb-4 border border-[#1e1e1e]">
                Sold
              </div>
            )}

            {/* QR tag note */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
              <p className="text-xs text-[#888] leading-relaxed">
                Every piece from Rethread Studios ships with a QR tag sewn in.
                Scan it anytime to find the artist who made it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
