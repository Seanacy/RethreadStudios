"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

interface Artist {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  piece_count?: number;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("rs_artists").select("*").order("created_at", { ascending: false });
      if (data) {
        const withCounts = await Promise.all(
          (data as Artist[]).map(async (a) => {
            const { count } = await supabase.from("rs_pieces").select("*", { count: "exact", head: true }).eq("artist_id", a.id).eq("status", "available");
            return { ...a, piece_count: count || 0 };
          })
        );
        setArtists(withCounts);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Artists</h1>
          <p className="text-[#888] text-sm">The people transforming thrift finds into wearable art</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#555]">Loading...</div>
        ) : artists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-4">✂️</p>
            <p className="text-[#888]">No artists yet. Be the first.</p>
            <Link href="/signup" className="inline-block mt-4 px-6 py-2.5 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-full hover:bg-[#d4c0a0]">
              Join as an Artist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-20">
            {artists.map((artist) => (
              <Link key={artist.id} href={`/artist/${artist.username}`} className="group bg-[#141414] border border-[#1e1e1e] rounded-xl p-6 hover:border-[#e8d5b7]/30 transition-colors text-center">
                <div className="w-16 h-16 rounded-full bg-[#e8d5b7] flex items-center justify-center text-[#0a0a0a] text-xl font-bold mx-auto mb-3">
                  {artist.display_name?.[0]?.toUpperCase() || artist.username[0].toUpperCase()}
                </div>
                <h3 className="text-base font-bold text-white mb-1">{artist.display_name || artist.username}</h3>
                <p className="text-xs text-[#888] mb-2">@{artist.username}</p>
                {artist.bio && <p className="text-xs text-[#555] line-clamp-2 mb-3">{artist.bio}</p>}
                <span className="text-[10px] text-[#e8d5b7]">{artist.piece_count} pieces available</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
