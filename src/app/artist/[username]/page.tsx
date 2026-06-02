"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

interface Artist {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  instagram: string;
  tiktok: string;
  twitter: string;
  website: string;
}

interface Piece {
  id: string;
  title: string;
  price: number;
  status: string;
  after_images: string[];
  is_one_of_one: boolean;
  collection_id: string | null;
}

interface Collection {
  id: string;
  title: string;
  mission_statement: string | null;
  cover_image: string | null;
}

interface Season {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  started_at: string;
  ended_at: string | null;
}

export default function ArtistProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pieces" | "collections" | "seasons">("pieces");

  useEffect(() => {
    async function load() {
      const { data: a } = await supabase.from("rs_artists").select("*").eq("username", username).single();
      if (!a) { setLoading(false); return; }
      setArtist(a as Artist);

      const { data: p } = await supabase.from("rs_pieces").select("*").eq("artist_id", (a as Artist).id).eq("status", "available").order("created_at", { ascending: false });
      setPieces((p || []) as Piece[]);

      const { data: c } = await supabase.from("rs_collections").select("*").eq("artist_id", (a as Artist).id).order("created_at", { ascending: false });
      setCollections((c || []) as Collection[]);

      const { data: s } = await supabase.from("rs_seasons").select("*").eq("artist_id", (a as Artist).id).order("started_at", { ascending: false });
      setSeasons((s || []) as Season[]);

      const { count } = await supabase.from("rs_follows").select("*", { count: "exact", head: true }).eq("artist_id", (a as Artist).id);
      setFollowerCount(count || 0);

      if (user) {
        const { data: f } = await supabase.from("rs_follows").select("id").eq("follower_id", user.id).eq("artist_id", (a as Artist).id).single();
        setIsFollowing(!!f);
      }

      setLoading(false);
    }
    load();
  }, [username, user]);

  const toggleFollow = async () => {
    if (!user || !artist) return;
    if (isFollowing) {
      await supabase.from("rs_follows").delete().eq("follower_id", user.id).eq("artist_id", artist.id);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await supabase.from("rs_follows").insert({ follower_id: user.id, artist_id: artist.id });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><span className="text-[#555]">Loading...</span></div>;
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="pt-20 text-center py-32">
          <p className="text-2xl text-[#555]">Artist not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Banner */}
      <div className="pt-16 h-48 md:h-56 bg-gradient-to-b from-[#1a1510] to-[#0a0a0a]" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16">
        {/* Artist header */}
        <div className="flex items-end gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-[#e8d5b7] flex items-center justify-center text-[#0a0a0a] text-3xl font-bold border-4 border-[#0a0a0a] flex-shrink-0">
            {artist.display_name?.[0]?.toUpperCase() || artist.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-2xl font-bold text-white truncate">{artist.display_name || artist.username}</h1>
            <p className="text-sm text-[#888]">@{artist.username}</p>
          </div>
          <div className="flex items-center gap-3 pb-1">
            <span className="text-sm text-[#888]">{followerCount} follower{followerCount !== 1 ? "s" : ""}</span>
            {user && user.id !== artist.id && (
              <button
                onClick={toggleFollow}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  isFollowing
                    ? "bg-[#141414] border border-[#1e1e1e] text-[#888] hover:text-white"
                    : "bg-[#e8d5b7] text-[#0a0a0a] hover:bg-[#d4c0a0]"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <p className="text-sm text-[#cccccc] leading-relaxed mb-4 max-w-2xl">{artist.bio}</p>
        )}

        {/* Social links */}
        <div className="flex gap-4 mb-8">
          {artist.instagram && <a href={`https://instagram.com/${artist.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#888] hover:text-[#e8d5b7]">Instagram</a>}
          {artist.tiktok && <a href={`https://tiktok.com/${artist.tiktok.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#888] hover:text-[#e8d5b7]">TikTok</a>}
          {artist.twitter && <a href={`https://x.com/${artist.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#888] hover:text-[#e8d5b7]">Twitter</a>}
          {artist.website && <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-xs text-[#888] hover:text-[#e8d5b7]">Website</a>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#1e1e1e]">
          {(["pieces", "collections", "seasons"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? "text-[#e8d5b7] border-b-2 border-[#e8d5b7]" : "text-[#888] hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Pieces */}
        {tab === "pieces" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
            {pieces.map((piece) => (
              <Link key={piece.id} href={`/piece/${piece.id}`} className="group">
                <div className="aspect-[3/4] bg-[#141414] rounded-lg overflow-hidden mb-2 relative">
                  {piece.after_images?.[0] ? (
                    <img src={piece.after_images[0]} alt={piece.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#333]">No image</div>
                  )}
                  {piece.is_one_of_one && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#0a0a0a]/80 text-[#e8d5b7] text-[10px] font-semibold rounded-full backdrop-blur-sm">1 of 1</span>
                  )}
                </div>
                <h3 className="text-sm text-white truncate">{piece.title}</h3>
                <span className="text-xs text-[#e8d5b7]">${piece.price}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Collections */}
        {tab === "collections" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
            {collections.map((col) => (
              <div key={col.id} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
                <h3 className="text-lg font-bold text-white mb-1">{col.title}</h3>
                {col.mission_statement && <p className="text-xs text-[#888] line-clamp-3">{col.mission_statement}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Seasons */}
        {tab === "seasons" && (
          <div className="flex flex-col gap-4 pb-20">
            {seasons.map((s) => (
              <div key={s.id} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  {s.is_active && <span className="w-2 h-2 rounded-full bg-green-400" />}
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                </div>
                {s.description && <p className="text-xs text-[#888] line-clamp-2">{s.description}</p>}
                <span className="text-[10px] text-[#555] mt-2 block">
                  {new Date(s.started_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  {s.ended_at ? ` — ${new Date(s.ended_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : " — Present"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
