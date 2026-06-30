"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowRight, Shield, User, Wrench } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username || !password) return;
    setSubmitting(true);
    try {
      await login(username, password);
      toast.success("Successfully logged in!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePresetLogin = async (role: "citizen" | "officer" | "admin") => {
    setSubmitting(true);
    let targetUser = "";
    let targetPass = "password";

    if (role === "admin") {
      targetUser = "admin_workspace";
    } else if (role === "officer") {
      targetUser = "officer_dispatch";
    } else {
      targetUser = "citizen_reporter";
    }

    setUsername(targetUser);
    setPassword(targetPass);

    try {
      await login(targetUser, targetPass);
      toast.success(`Access granted: logged in as ${role.toUpperCase()}`);
    } catch (err: any) {
      toast.error("Preset login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#030712] overflow-hidden selection:bg-purple-500/30">
      {/* Background glowing spheres */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl glassmorphism-premium space-y-8 transition-all-300 hover:shadow-purple-500/5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-float">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
              CivicMind <span className="text-purple-400">AI</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 font-medium tracking-wide">
              Smart City Incident Command Center
            </p>
          </div>
        </div>

        {/* Quick presets panel */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block text-center">
            Demo Portal Quick Access (One-Click)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePresetLogin("citizen")}
              disabled={submitting}
              className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 transition text-[11px] font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <User className="w-4 h-4 text-purple-400" />
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handlePresetLogin("officer")}
              disabled={submitting}
              className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/30 transition text-[11px] font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Wrench className="w-4 h-4 text-indigo-400" />
              Officer
            </button>
            <button
              type="button"
              onClick={() => handlePresetLogin("admin")}
              disabled={submitting}
              className="py-2.5 px-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 border border-white/5 hover:border-emerald-500/30 transition text-[11px] font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              Admin
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest">Or Sign In Manually</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              disabled={submitting}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:border-purple-500 outline-none transition font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={submitting}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-sm text-white focus:border-purple-500 outline-none transition font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Open Console <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          New to CivicMind?{" "}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
