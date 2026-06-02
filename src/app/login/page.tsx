"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    if (loginErr) {
      setError(loginErr.message);
      setLoading(false);
      return;
    }

    router.push("/studio");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-[#e8d5b7]">Rethread</span>
            <span className="text-white/40 font-light ml-1">Studios</span>
          </Link>
          <p className="text-[#888] text-sm mt-2">Welcome back</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-[#888] font-medium mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg text-white text-sm focus:outline-none focus:border-[#e8d5b7] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-[#e8d5b7] text-[#0a0a0a] font-semibold rounded-lg hover:bg-[#d4c0a0] transition-colors text-sm disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="text-center mt-4 text-xs text-[#555]">
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#e8d5b7] hover:text-[#d4c0a0]">
              Join Rethread Studios
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
