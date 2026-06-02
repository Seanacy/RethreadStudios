"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function NewSeasonPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) { setError("Season needs a title."); return; }

    setSaving(true);
    const colors = colorPalette.split(",").map((c) => c.trim()).filter(Boolean);

    const { error: insertErr } = await supabase.from("rs_seasons").insert({
      artist_id: user!.id,
      title,
      description: description || null,
      color_palette: colors.length > 0 ? colors : null,
      is_active: true,
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
          <h1 className="text-2xl font-bold text-white">Begin a Season</h1>
        </div>

        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 mb-8">
          <p className="text-sm text-[#888] leading-relaxed">
            A season is a chapter of your creative life. It can last a week or a year.
            It ends when you're ready to move on. Start one when you feel a shift in
            your direction, inspiration, or mood.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>}

          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Season Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New City Energy, Quiet Winter, Raw & Unfinished..."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]"
            />
          </div>

          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">What's this season about?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Where are you creatively right now? What's inspiring you?"
              rows={4}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Color Palette (optional)</label>
            <p className="text-[10px] text-[#555] mb-2">Comma-separated colors or hex codes</p>
            <input
              type="text"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              placeholder="e.g. rust, cream, forest green, #2d1b0e"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors text-sm disabled:opacity-50"
          >
            {saving ? "Starting..." : "Begin Season"}
          </button>
        </form>
      </div>
    </div>
  );
}
