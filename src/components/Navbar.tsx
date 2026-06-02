"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1e1e1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-[#e8d5b7]">Rethread</span>
            <span className="text-white/60 font-light ml-1">Studios</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="text-sm text-[#888] hover:text-white transition-colors">
            Browse
          </Link>
          <Link href="/artists" className="text-sm text-[#888] hover:text-white transition-colors">
            Artists
          </Link>
          <Link href="/spotted" className="text-sm text-[#888] hover:text-white transition-colors">
            Spotted
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link href="/studio" className="text-sm text-[#e8d5b7] hover:text-[#d4c0a0] transition-colors font-medium">
                My Studio
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-[#555] hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-[#888] hover:text-white transition-colors">
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-1.5 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-full hover:bg-[#d4c0a0] transition-colors"
              >
                Join
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1e1e1e] bg-[#0a0a0a] px-4 py-4 flex flex-col gap-4">
          <Link href="/browse" onClick={() => setMenuOpen(false)} className="text-sm text-[#888] hover:text-white">Browse</Link>
          <Link href="/artists" onClick={() => setMenuOpen(false)} className="text-sm text-[#888] hover:text-white">Artists</Link>
          <Link href="/spotted" onClick={() => setMenuOpen(false)} className="text-sm text-[#888] hover:text-white">Spotted</Link>
          {user ? (
            <>
              <Link href="/studio" onClick={() => setMenuOpen(false)} className="text-sm text-[#e8d5b7] font-medium">My Studio</Link>
              <button onClick={() => { supabase.auth.signOut(); setMenuOpen(false); }} className="text-sm text-[#555] text-left">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-[#888]">Log In</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="text-sm text-[#e8d5b7] font-medium">Join Rethread Studios</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
