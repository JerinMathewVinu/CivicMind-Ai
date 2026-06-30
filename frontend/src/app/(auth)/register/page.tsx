"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !displayName) return;
    setSubmitting(true);
    try {
      await register(username, email, password, displayName);
      toast.success("Account created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#070b13] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl glassmorphism space-y-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
            <p className="text-slate-400 text-xs mt-1">Join the CivicMind AI smart community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="E.g., jerinpatel"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E.g., jerin@example.com"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="E.g., Jerin Patel"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !username || !email || !password || !displayName}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Register Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
