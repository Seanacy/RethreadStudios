"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["Jackets", "Tops", "Bottoms", "Dresses", "Accessories", "Shoes", "Other"];

export default function NewPiecePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [category, setCategory] = useState("Other");
  const [isOneOfOne, setIsOneOfOne] = useState(true);
  const [quantity, setQuantity] = useState("1");
  const [isGive, setIsGive] = useState(false);
  const [collectionId, setCollectionId] = useState("");
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);
  const [beforeFiles, setBeforeFiles] = useState<File[]>([]);
  const [afterFiles, setAfterFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    supabase.from("rs_collections").select("id, title").eq("artist_id", user.id).then(({ data }) => {
      setCollections((data || []) as { id: string; title: string }[]);
    });
  }, [user, authLoading, router]);

  const uploadImages = async (files: File[], folder: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const path = `${user!.id}/${folder}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("rethread").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("rethread").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) { setError("Title and price are required."); return; }
    if (afterFiles.length === 0) { setError("Add at least one 'after' photo."); return; }

    // 3-piece mission statement gate
    if (collectionId) {
      const { count } = await supabase.from("rs_pieces").select("*", { count: "exact", head: true }).eq("collection_id", collectionId);
      if ((count || 0) >= 3) {
        const { data: col } = await supabase.from("rs_collections").select("mission_statement").eq("id", collectionId).single();
        if (col && !col.mission_statement) {
          setError("This collection has 3+ pieces. Add a mission statement to the collection before adding more.");
          return;
        }
      }
    }

    setSaving(true);
    setError("");

    try {
      const beforeUrls = await uploadImages(beforeFiles, "before");
      const afterUrls = await uploadImages(afterFiles, "after");

      const { error: insertErr } = await supabase.from("rs_pieces").insert({
        artist_id: user!.id,
        title,
        description,
        price: isGive ? 0 : parseFloat(price),
        size,
        category,
        is_one_of_one: isOneOfOne,
        quantity: isOneOfOne ? 1 : parseInt(quantity) || 1,
        collection_id: collectionId || null,
        before_images: beforeUrls,
        after_images: afterUrls,
        status: isGive ? "given" : "available",
      });

      if (insertErr) throw insertErr;

      // Notify followers about the new piece
      const { data: followers } = await supabase.from("rs_follows").select("follower_id").eq("artist_id", user!.id);
      if (followers && followers.length > 0) {
        const { data: artist } = await supabase.from("rs_artists").select("username, display_name").eq("id", user!.id).single();
        const artistName = (artist as { display_name: string; username: string })?.display_name || (artist as { username: string })?.username || "An artist";
        const notifications = followers.map((f) => ({
          user_id: f.follower_id,
          type: "new_piece",
          title: `${artistName} dropped a new piece`,
          message: `"${title}" — $${isGive ? "Free (Given)" : price}`,
          link: `/artist/${(artist as { username: string })?.username}`,
        }));
        await supabase.from("rs_notifications").insert(notifications);
      }

      router.push("/studio");
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
          <Link href="/studio" className="text-[#888] hover:text-white text-sm">← Studio</Link>
          <h1 className="text-2xl font-bold text-white">New Piece</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bleached Denim Trucker Jacket"
              className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Story / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story of this piece — where you found it, what you did to transform it, what inspired the design..."
              rows={4}
              className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] resize-none"
            />
          </div>

          {/* Price + Size row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Price *</label>
              <div className="flex items-center">
                <span className="text-[#888] mr-2">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="45"
                  className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Size</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="M, L, One Size..."
                className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    category === cat
                      ? "bg-[#e8d5b7] text-[#0a0a0a]"
                      : "bg-[#141414] text-[#888] border border-[#1e1e1e] hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* One of one toggle */}
          <div className="flex items-center justify-between bg-[#141414] border border-[#1e1e1e] rounded-lg p-4">
            <div>
              <span className="text-sm text-white font-medium">One of One</span>
              <p className="text-xs text-[#555]">This is a unique piece — only one exists</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOneOfOne(!isOneOfOne)}
              className={`w-12 h-6 rounded-full transition-colors ${isOneOfOne ? "bg-[#e8d5b7]" : "bg-[#333]"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${isOneOfOne ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Give version toggle */}
          <div className="flex items-center justify-between bg-[#141414] border border-[#1e1e1e] rounded-lg p-4">
            <div>
              <span className="text-sm text-white font-medium">Give This Piece</span>
              <p className="text-xs text-[#555]">Donate instead of sell — price becomes $0 and it's marked as given</p>
            </div>
            <button
              type="button"
              onClick={() => setIsGive(!isGive)}
              className={`w-12 h-6 rounded-full transition-colors ${isGive ? "bg-green-500" : "bg-[#333]"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${isGive ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {!isOneOfOne && (
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Quantity Available</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-24 px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]"
              />
            </div>
          )}

          {/* Collection */}
          {collections.length > 0 && (
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Add to Collection (optional)</label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7]"
              >
                <option value="">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Before photos */}
          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">Before Photos (the thrift find)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setBeforeFiles(Array.from(e.target.files || []))}
              className="w-full text-sm text-[#888] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#141414] file:text-[#e8d5b7] hover:file:bg-[#1e1e1e]"
            />
            {beforeFiles.length > 0 && (
              <p className="text-xs text-[#555] mt-1">{beforeFiles.length} file(s) selected</p>
            )}
          </div>

          {/* After photos */}
          <div>
            <label className="text-xs text-[#888] font-medium mb-1 block">After Photos (the transformation) *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setAfterFiles(Array.from(e.target.files || []))}
              className="w-full text-sm text-[#888] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#141414] file:text-[#e8d5b7] hover:file:bg-[#1e1e1e]"
            />
            {afterFiles.length > 0 && (
              <p className="text-xs text-[#555] mt-1">{afterFiles.length} file(s) selected</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors text-sm disabled:opacity-50"
          >
            {saving ? "Listing..." : "List Piece"}
          </button>
        </form>
      </div>
    </div>
  );
}
