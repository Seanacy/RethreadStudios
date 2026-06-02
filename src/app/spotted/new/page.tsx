"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface PurchasedPiece {
  id: string;
  title: string;
  artist_id: string;
  after_images: string[];
  artist?: { username: string; display_name: string };
}

export default function NewSpottedPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pieces, setPieces] = useState<PurchasedPiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    // For now, show all pieces since we don't have order tracking yet
    // In production, this would filter to only pieces the user has purchased
    async function load() {
      const { data } = await supabase
        .from("rs_pieces")
        .select("id, title, artist_id, after_images, artist:rs_artists(username, display_name)")
        .order("created_at", { ascending: false })
        .limit(50);
      setPieces((data || []) as unknown as PurchasedPiece[]);
    }
    load();
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPieceId || !file) {
      setError("Select a piece and upload a photo.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Upload image
      const path = `spotted/${user!.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("rethread").upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("rethread").getPublicUrl(path);

      // Find the piece to get artist_id
      const piece = pieces.find((p) => p.id === selectedPieceId);
      if (!piece) throw new Error("Piece not found");

      // Insert spotted post
      const { error: insertErr } = await supabase.from("rs_spotted").insert({
        user_id: user!.id,
        piece_id: selectedPieceId,
        artist_id: piece.artist_id,
        image_url: urlData.publicUrl,
        caption: caption || null,
      });

      if (insertErr) throw insertErr;
      router.push("/spotted");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/spotted" className="text-[#888] hover:text-white text-sm">← Spotted</Link>
          <h1 className="text-2xl font-bold text-white">Post a Spot</h1>
        </div>

        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 mb-6">
          <p className="text-sm text-[#888] leading-relaxed">
            Show the world how you wear your Rethread piece. Your photo will appear on the Spotted feed
            and on the artist's profile — helping them grow their audience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>}

          {/* Select piece */}
          <div>
            <label className="text-xs text-[#888] font-medium mb-2 block">Which piece are you wearing? *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {pieces.map((piece) => (
                <button
                  key={piece.id}
                  type="button"
                  onClick={() => setSelectedPieceId(piece.id)}
                  className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedPieceId === piece.id ? "border-[#e8d5b7]" : "border-transparent"
                  }`}
                >
                  {piece.after_images?.[0] ? (
                    <img src={piece.after_images[0]} alt={piece.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-[10px] text-[#555] p-1 text-center">
                      {piece.title}
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedPieceId && (
              <p className="text-xs text-[#e8d5b7] mt-2">
                Selected: {pieces.find((p) => p.id === selectedPieceId)?.title}
              </p>
            )}
          </div>

          {/* Photo upload */}
          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Your Photo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-[#888] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#1e1e1e] file:text-[#e8d5b7] hover:file:bg-[#252525]"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Caption (optional)</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Where are you wearing it? What's the occasion?"
              rows={3}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors text-sm disabled:opacity-50"
          >
            {saving ? "Posting..." : "Post to Spotted"}
          </button>
        </form>
      </div>
    </div>
  );
}
