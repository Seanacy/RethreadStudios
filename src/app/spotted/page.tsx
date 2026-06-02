"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

interface SpottedPost {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
  piece: { id: string; title: string };
  artist: { username: string; display_name: string };
}

export default function SpottedPage() {
  const [posts, setPosts] = useState<SpottedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("rs_spotted")
        .select("id, image_url, caption, created_at, piece:rs_pieces(id, title), artist:rs_artists(username, display_name)")
        .order("created_at", { ascending: false })
        .limit(50);
      setPosts((data || []) as unknown as SpottedPost[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Spotted</h1>
              <p className="text-[#888] text-sm">Real people wearing Rethread pieces in the wild</p>
            </div>
            <Link href="/spotted/new" className="px-5 py-2 bg-[#e8d5b7] text-[#0a0a0a] text-sm font-semibold rounded-full hover:bg-[#d4c0a0]">
              + Post a Spot
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#555]">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl mb-4">📸</p>
            <h2 className="text-xl font-bold text-white mb-2">No spots yet</h2>
            <p className="text-[#888] max-w-md mx-auto">
              When buyers post photos of themselves wearing Rethread pieces, they show up here.
              Every photo links back to the artist who made it.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-20">
            {posts.map((post) => (
              <div key={post.id} className="group">
                <div className="aspect-square bg-[#141414] rounded-lg overflow-hidden mb-2">
                  <img src={post.image_url} alt={post.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                {post.caption && <p className="text-xs text-[#cccccc] line-clamp-2 mb-1">{post.caption}</p>}
                <div className="flex items-center justify-between">
                  <Link href={`/piece/${(post.piece as unknown as { id: string }).id}`} className="text-[10px] text-[#e8d5b7] hover:underline truncate">
                    {(post.piece as unknown as { title: string }).title}
                  </Link>
                  <Link href={`/artist/${(post.artist as unknown as { username: string }).username}`} className="text-[10px] text-[#555] hover:text-[#888]">
                    @{(post.artist as unknown as { username: string }).username}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
