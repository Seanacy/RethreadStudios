"use client";

import { useState, useEffect } from "react";
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
  instagram: string;
  tiktok: string;
  twitter: string;
  website: string;
}

interface Collection {
  id: string;
  title: string;
}

interface Season {
  id: string;
  title: string;
}

export default function StudioSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [copiedEmbed, setCopiedEmbed] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    async function load() {
      const { data: a } = await supabase.from("rs_artists").select("*").eq("id", user!.id).single();
      if (!a) return;
      const art = a as Artist;
      setArtist(art);
      setDisplayName(art.display_name || "");
      setBio(art.bio || "");
      setInstagram(art.instagram || "");
      setTiktok(art.tiktok || "");
      setTwitter(art.twitter || "");
      setWebsite(art.website || "");

      const { data: c } = await supabase.from("rs_collections").select("id, title").eq("artist_id", user!.id);
      setCollections((c || []) as Collection[]);

      const { data: s } = await supabase.from("rs_seasons").select("id, title").eq("artist_id", user!.id);
      setSeasons((s || []) as Season[]);
    }
    load();
  }, [user, authLoading, router]);

  const handleSave = async () => {
    if (!artist) return;
    setSaving(true);
    await supabase.from("rs_artists").update({
      display_name: displayName,
      bio,
      instagram,
      tiktok,
      twitter,
      website,
      updated_at: new Date().toISOString(),
    }).eq("id", artist.id);
    setSaveMsg("Saved!");
    setTimeout(() => setSaveMsg(""), 3000);
    setSaving(false);
  };

  const copyEmbed = (type: string, id: string, label: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const iframe = `<iframe src="${baseUrl}/api/embed?type=${type}&id=${id}" width="100%" height="280" frameborder="0" style="border:none;border-radius:12px"></iframe>`;
    navigator.clipboard.writeText(iframe);
    setCopiedEmbed(label);
    setTimeout(() => setCopiedEmbed(""), 2000);
  };

  if (authLoading || !artist) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/studio" className="text-[#888] hover:text-white text-sm">← Studio</Link>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>

        {/* Profile settings */}
        <div className="flex flex-col gap-5 mb-12">
          <h2 className="text-lg font-bold text-white">Profile</h2>

          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]" />
          </div>

          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Instagram</label>
              <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle"
                className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]" />
            </div>
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">TikTok</label>
              <input type="text" value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="@handle"
                className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]" />
            </div>
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Twitter / X</label>
              <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle"
                className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]" />
            </div>
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Website</label>
              <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..."
                className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4c0a0] text-sm disabled:opacity-50">
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {saveMsg && <span className="text-sm text-green-400">{saveMsg}</span>}
          </div>
        </div>

        {/* Embed codes */}
        <div className="border-t border-[#1e1e1e] pt-8">
          <h2 className="text-lg font-bold text-white mb-2">Embed Your Work</h2>
          <p className="text-xs text-[#888] mb-6">Copy an embed code and paste it on any website to showcase your pieces.</p>

          <div className="flex flex-col gap-3">
            {/* Artist embed */}
            <div className="flex items-center justify-between bg-[#141414] border border-[#1e1e1e] rounded-lg p-4">
              <div>
                <span className="text-sm text-white font-medium">Your Portfolio</span>
                <p className="text-[10px] text-[#555]">Shows your latest available pieces</p>
              </div>
              <button onClick={() => copyEmbed("artist", artist.username, "portfolio")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${copiedEmbed === "portfolio" ? "bg-green-500/20 text-green-400" : "bg-[#1e1e1e] text-[#888] hover:text-white"}`}>
                {copiedEmbed === "portfolio" ? "Copied!" : "Copy Embed"}
              </button>
            </div>

            {/* Collection embeds */}
            {collections.map((col) => (
              <div key={col.id} className="flex items-center justify-between bg-[#141414] border border-[#1e1e1e] rounded-lg p-4">
                <div>
                  <span className="text-sm text-white font-medium">{col.title}</span>
                  <p className="text-[10px] text-[#555]">Collection</p>
                </div>
                <button onClick={() => copyEmbed("collection", col.id, col.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${copiedEmbed === col.id ? "bg-green-500/20 text-green-400" : "bg-[#1e1e1e] text-[#888] hover:text-white"}`}>
                  {copiedEmbed === col.id ? "Copied!" : "Copy Embed"}
                </button>
              </div>
            ))}

            {/* Season embeds */}
            {seasons.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-[#141414] border border-[#1e1e1e] rounded-lg p-4">
                <div>
                  <span className="text-sm text-white font-medium">{s.title}</span>
                  <p className="text-[10px] text-[#555]">Season</p>
                </div>
                <button onClick={() => copyEmbed("season", s.id, s.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${copiedEmbed === s.id ? "bg-green-500/20 text-green-400" : "bg-[#1e1e1e] text-[#888] hover:text-white"}`}>
                  {copiedEmbed === s.id ? "Copied!" : "Copy Embed"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Public profile link */}
        <div className="border-t border-[#1e1e1e] pt-8 mt-8">
          <h2 className="text-lg font-bold text-white mb-2">Your Public Profile</h2>
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-lg p-4 flex items-center justify-between">
            <code className="text-sm text-[#e8d5b7]">{typeof window !== "undefined" ? window.location.origin : ""}/artist/{artist.username}</code>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/artist/${artist.username}`); setCopiedEmbed("profile"); setTimeout(() => setCopiedEmbed(""), 2000); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${copiedEmbed === "profile" ? "bg-green-500/20 text-green-400" : "bg-[#1e1e1e] text-[#888] hover:text-white"}`}>
              {copiedEmbed === "profile" ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
