"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

interface Piece {
  id: string;
  title: string;
  price: number;
  category: string;
  after_images: string[];
  is_one_of_one: boolean;
  artist_id: string;
  artist?: { username: string; display_name: string };
}

const CATEGORIES = ["All", "Jackets", "Tops", "Bottoms", "Dresses", "Accessories", "Shoes", "Other"];

export default function BrowsePage() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function load() {
      let query = supabase
        .from("rs_pieces")
        .select("id, title, price, category, after_images, is_one_of_one, artist_id, artist:rs_artists(username, display_name)")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      const { data } = await query;
      setPieces((data as unknown as Piece[]) || []);
      setLoading(false);
    }
    load();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse</h1>
          <p className="text-[#888] text-sm">One-of-one pieces transformed from thrift finds</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#e8d5b7] text-[#0a0a0a]"
                  : "bg-[#141414] text-[#888] border border-[#1e1e1e] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pieces grid */}
        {loading ? (
          <div className="text-center py-20 text-[#555]">Loading...</div>
        ) : pieces.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-4">✂️</p>
            <p className="text-[#888]">No pieces listed yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pieces.map((piece) => (
              <Link key={piece.id} href={`/piece/${piece.id}`} className="group">
                <div className="aspect-[3/4] bg-[#141414] rounded-lg overflow-hidden mb-3 relative">
                  {piece.after_images?.[0] ? (
                    <img
                      src={piece.after_images[0]}
                      alt={piece.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#333]">
                      No image
                    </div>
                  )}
                  {piece.is_one_of_one && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#0a0a0a]/80 text-[#e8d5b7] text-[10px] font-semibold rounded-full backdrop-blur-sm">
                      1 of 1
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-white truncate">{piece.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#e8d5b7]">${piece.price}</span>
                  {piece.artist && (
                    <span className="text-[10px] text-[#555]">
                      {(piece.artist as unknown as { display_name: string; username: string }).display_name || (piece.artist as unknown as { username: string }).username}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
