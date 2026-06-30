"use client";

import Link from "next/link";
import { Shield, Sparkles, MapPin, Zap, ArrowRight, Award } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b13] font-sans selection:bg-purple-500/30">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation bar */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white bg-clip-text">
              CivicMind <span className="text-purple-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 transition border border-white/10 flex items-center gap-2"
            >
              Enter App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-3.5 h-3.5" /> Next-Generation Civic Intelligence
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15] mb-8">
          AI That Doesn't Just Report Problems — <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">Helps Cities Solve Them.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          CivicMind AI transforms civic engagement by autonomously prioritizing reports, routing assignments to departments, and generating predictive metrics to fix city problems faster.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 group"
          >
            Launch Citizen Console <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition border border-white/10 flex items-center justify-center"
          >
            Explore Platform
          </a>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { value: "14,820", label: "Issues Resolved" },
            { value: "12 mins", label: "Average AI Triage" },
            { value: "48 hours", label: "Average Dispatch Time" },
            { value: "98.4%", label: "Citizen Verification" },
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl glassmorphism text-center">
              <div className="text-3xl font-extrabold text-white mb-2 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Core Pillars */}
        <section id="features" className="pt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Core Technology Layers</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Powered by standard API interfaces and real-time visual models.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-8 rounded-3xl glassmorphism flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Vision Triage</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Autonomously determines category confidence, severity scale, and priority weight of reported issues based on upload images and reports descriptions using Gemini 2.5.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl glassmorphism flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Geographic Analytics</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Pins civic reports to interactive city maps, generating predictive heatmaps of critical clusters to alert street crews before failure occurs.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl glassmorphism flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Gamified Accountability</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Earn points and unlock civic status badges by reporting issues or verifying reports submitted by fellow neighbors.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div>© {new Date().getFullYear()} CivicMind AI. Built with maximum aesthetics.</div>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-slate-300 transition">Console</Link>
            <a href="#" className="hover:text-slate-300 transition">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}