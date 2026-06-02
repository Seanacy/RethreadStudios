"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Piece {
  id: string;
  title: string;
  price: number;
  after_images: string[];
  artist_id: string;
  artist?: { username: string; display_name: string };
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Piece[]>([]);

  useEffect(() => {
    async function loadFeatured() {
      const { data } = await supabase
        .from("rs_pieces")
        .select("id, title, price, after_images, artist_id, artist:rs_artists(username, display_name)")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(8);
      if (data) setFeatured(data as unknown as Piece[]);
    }
    loadFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#e8d5b7] mb-6">
            Where Thrift Meets Art
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
            Rethread
            <span className="text-white/40 font-light ml-3">Studios</span>
          </h1>
          <p className="text-[#888] max-w-xl mx-auto leading-relaxed mb-10 text-lg">
            A marketplace for artists who transform secondhand clothing into
            one-of-one pieces. Every garment has a story. Every artist has a vision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/browse"
              className="px-8 py-3 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-full hover:bg-[#d4c0a0] transition-colors text-sm"
            >
              Browse Pieces
            </Link>
            <Link
              href="/signup"
              className="px-8 py-3 border border-[#1e1e1e] text-white font-medium rounded-full hover:bg-[#141414] transition-colors text-sm"
            >
              Join as an Artist
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              num: "01",
              title: "Transform",
              desc: "Artists find raw materials at thrift stores and transform them into something entirely new.",
            },
            {
              num: "02",
              title: "List",
              desc: "Photograph the before and after. Tell the story. Set the price. Every piece ships with a QR tag linking back to you.",
            },
            {
              num: "03",
              title: "Connect",
              desc: "Buyers discover your work, follow your journey, and wear your art. Every scan of your tag grows your audience.",
            },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <span className="text-[#e8d5b7] text-xs font-bold tracking-widest">{step.num}</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-3">{step.title}</h3>
              <p className="text-sm text-[#888] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured pieces */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Latest Drops</h2>
            <Link href="/browse" className="text-sm text-[#e8d5b7] hover:text-[#d4c0a0]">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((piece) => (
              <Link key={piece.id} href={`/piece/${piece.id}`} className="group">
                <div className="aspect-[3/4] bg-[#141414] rounded-lg overflow-hidden mb-3">
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
                </div>
                <h3 className="text-sm font-medium text-white truncate">{piece.title}</h3>
                <p className="text-xs text-[#888]">
                  ${piece.price}
                  {piece.artist && (
                    <span className="text-[#555] ml-1">
                      by {(piece.artist as unknown as { display_name: string; username: string }).display_name || (piece.artist as unknown as { username: string }).username}
                    </span>
                  )}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state — when no pieces exist yet */}
      {featured.length === 0 && (
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="bg-[#141414] rounded-2xl border border-[#1e1e1e] p-12">
            <p className="text-3xl mb-4">✂️</p>
            <h2 className="text-xl font-bold text-white mb-3">The studio is almost ready</h2>
            <p className="text-[#888] mb-6 max-w-md mx-auto">
              We're opening our doors to artists who transform thrift finds into
              wearable art. Be among the first to list your work.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-full hover:bg-[#d4c0a0] transition-colors text-sm"
            >
              Join as an Artist
            </Link>
          </div>
        </section>
      )}

      {/* For Artists section */}
      <section className="border-t border-[#1e1e1e]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#e8d5b7] mb-4">
                For Artists
              </p>
              <h2 className="text-3xl font-bold text-white mb-4">
                Your art deserves more than a feed
              </h2>
              <p className="text-[#888] leading-relaxed mb-6">
                Organize your work into Collections with a creative mission.
                Build Seasons that tell the story of where you are as an artist.
                Every piece you sell carries a QR tag that links back to you —
                turning every garment into a walking portfolio.
              </p>
              <Link
                href="/signup"
                className="text-sm text-[#e8d5b7] hover:text-[#d4c0a0] font-medium"
              >
                Start your studio →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Collections", "Seasons", "QR Tags", "Spotted Feed"].map((feature) => (
                <div
                  key={feature}
                  className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 text-center"
                >
                  <span className="text-sm font-medium text-white">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#555]">
            Rethread Studios 2026
          </span>
          <div className="flex gap-6">
            <Link href="/about" className="text-xs text-[#555] hover:text-white">About</Link>
            <Link href="/browse" className="text-xs text-[#555] hover:text-white">Browse</Link>
            <Link href="/artists" className="text-xs text-[#555] hover:text-white">Artists</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
