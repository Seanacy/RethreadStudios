"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"artist" | "buyer">("artist");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setError("Fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error: signupErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: displayName, role } },
    });

    if (signupErr) {
      setError(signupErr.message);
      setLoading(false);
      return;
    }

    // Create artist profile if role is artist
    if (data.user && role === "artist") {
      await supabase.from("rs_artists").insert({
        id: data.user.id,
        username,
        display_name: displayName || username,
        role: "artist",
      });
    }

    router.push(role === "artist" ? "/studio" : "/browse");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-[#e8d5b7]">Rethread</span>
            <span className="text-white/40 font-light ml-1">Studios</span>
          </Link>
          <p className="text-[#888] text-sm mt-2">Join the studio</p>
        </div>

        <form onSubmit={handleSignup} className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-8">
          {/* Role toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setRole("artist")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                role === "artist"
                  ? "bg-[#e8d5b7] text-[#0a0a0a]"
                  : "bg-[#1e1e1e] text-[#888] hover:text-white"
              }`}
            >
              I'm an Artist
            </button>
            <button
              type="button"
              onClick={() => setRole("buyer")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                role === "buyer"
                  ? "bg-[#e8d5b7] text-[#0a0a0a]"
                  : "bg-[#1e1e1e] text-[#888] hover:text-white"
              }`}
            >
              I'm a Buyer
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Username *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="your_handle"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
              />
            </div>

            {role === "artist" && (
              <div>
                <label className="text-xs text-[#888] font-medium mb-1 block">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How your name appears on your studio"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6+ characters"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors text-sm disabled:opacity-50"
          >
            {loading ? "Creating..." : role === "artist" ? "Open Your Studio" : "Create Account"}
          </button>

          <p className="text-center mt-4 text-xs text-[#555]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#e8d5b7] hover:text-[#d4c0a0]">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
