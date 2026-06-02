"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function NewCollectionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError("Collection needs a title."); return; }

    setSaving(true);
    const { error: insertErr } = await supabase.from("rs_collections").insert({
      artist_id: user!.id,
      title,
      mission_statement: missionStatement || null,
    });

    if (insertErr) { setError(insertErr.message); setSaving(false); return; }
    router.push("/studio");
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/studio" className="text-[#888] hover:text-white text-sm">← Studio</Link>
          <h1 className="text-2xl font-bold text-white">New Collection</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>}

          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Collection Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Earth & Denim, Neon Revival, Quiet Layers..."
              className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]"
            />
          </div>

          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Mission Statement</label>
            <p className="text-[10px] text-[#555] mb-2">
              What's the creative direction? You can add this later — it becomes required after your 3rd piece.
            </p>
            <textarea
              value={missionStatement}
              onChange={(e) => setMissionStatement(e.target.value)}
              placeholder="This collection explores..."
              rows={4}
              className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors text-sm disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Collection"}
          </button>
        </form>
      </div>
    </div>
  );
}
