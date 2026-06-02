"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
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
  collection_id: string | null;
  qr_code_url: string | null;
  created_at: string;
}

export default function StudioPieceDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [piece, setPiece] = useState<Piece | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    async function load() {
      const { data: p } = await supabase.from("rs_pieces").select("*").eq("id", id).eq("artist_id", user!.id).single();
      if (!p) { router.push("/studio"); return; }
      setPiece(p as Piece);

      // Fetch QR code
      const { data: artist } = await supabase.from("rs_artists").select("username").eq("id", user!.id).single();
      if (artist) {
        const res = await fetch(`/api/qr?artist=${(artist as { username: string }).username}&piece=${id}`);
        const qr = await res.json();
        setQrImage(qr.qr_image);
      }

      setLoading(false);
    }
    load();
  }, [id, user, authLoading, router]);

  const toggleStatus = async () => {
    if (!piece) return;
    const newStatus = piece.status === "available" ? "sold" : "available";
    await supabase.from("rs_pieces").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", piece.id);
    setPiece({ ...piece, status: newStatus });
  };

  const deletePiece = async () => {
    if (!piece || !confirm("Delete this piece? This cannot be undone.")) return;
    await supabase.from("rs_pieces").delete().eq("id", piece.id);
    router.push("/studio");
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><span className="text-[#555]">Loading...</span></div>;
  }

  if (!piece) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="pt-20 max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <Link href="/studio" className="text-[#888] hover:text-white text-sm">← Studio</Link>

        <div className="grid md:grid-cols-2 gap-8 mt-4">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-[#141414] rounded-xl overflow-hidden mb-3">
              {piece.after_images?.[0] ? (
                <img src={piece.after_images[0]} alt={piece.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#333]">No image</div>
              )}
            </div>

            {/* Before images */}
            {piece.before_images && piece.before_images.length > 0 && (
              <div>
                <span className="text-xs text-[#888] font-medium mb-2 block">Before (Thrift Find)</span>
                <div className="flex gap-2">
                  {piece.before_images.map((img, i) => (
                    <div key={i} className="w-20 h-24 rounded-lg overflow-hidden bg-[#141414]">
                      <img src={img} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{piece.title}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold text-[#e8d5b7]">${piece.price}</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                piece.status === "available" ? "bg-green-500/20 text-green-400" :
                piece.status === "sold" ? "bg-[#e8d5b7]/20 text-[#e8d5b7]" : "bg-[#333] text-[#888]"
              }`}>
                {piece.status}
              </span>
              {piece.is_one_of_one && <span className="text-xs text-[#e8d5b7]">1 of 1</span>}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {piece.size && <span className="px-3 py-1 bg-[#141414] border border-[#1e1e1e] rounded-lg text-xs text-[#888]">Size: {piece.size}</span>}
              {piece.category && <span className="px-3 py-1 bg-[#141414] border border-[#1e1e1e] rounded-lg text-xs text-[#888]">{piece.category}</span>}
            </div>

            {piece.description && (
              <p className="text-sm text-[#cccccc] leading-relaxed mb-6">{piece.description}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-8">
              <button onClick={toggleStatus}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  piece.status === "available"
                    ? "bg-[#e8d5b7] text-[#0a0a0a] hover:bg-[#d4c0a0]"
                    : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                }`}>
                {piece.status === "available" ? "Mark as Sold" : "Mark as Available"}
              </button>
              <button onClick={deletePiece}
                className="w-full py-2.5 rounded-lg text-sm text-[#555] border border-[#1e1e1e] hover:text-red-400 hover:border-red-400/30 transition-colors">
                Delete Piece
              </button>
            </div>

            {/* QR Code */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">QR Tag</h3>
              <p className="text-xs text-[#888] mb-4">Print this and attach it to the garment. Anyone who scans it finds your profile.</p>
              {qrImage ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <img src={qrImage} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <a href={qrImage} download={`rethread-qr-${piece.id.slice(0, 8)}.png`}
                    className="text-xs text-[#e8d5b7] hover:text-[#d4c0a0]">
                    Download QR
                  </a>
                </div>
              ) : (
                <div className="text-center py-4 text-[#555] text-xs">Generating QR...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
