"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, MapPin, CheckSquare, Clock, Map, Navigation, 
  Wrench, CheckCircle2, ChevronRight, ListTodo, LogOut 
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import { CATEGORY_LABELS, SEVERITY_STYLES } from "@/lib/constants";
import { titleCase, formatDate } from "@/lib/utils";
import type { Issue } from "@/types";
import { toast } from "sonner";
import GoogleMap from "@/components/maps/GoogleMap";

export default function OfficerDashboard() {
  const { profile, loading, logout, demoMode, toggleDemoMode, switchRole } = useAuth();
  const router = useRouter();
  const [activeIssueId, setActiveIssueId] = useState<string>("iss_2");
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: "iss_2",
      title: "Overflowing garbage disposal near park",
      description: "Public bin is completely overflowing. Garbage has spilled onto the sidewalk and is attracting stray dogs.",
      category: "garbage",
      status: "assigned",
      severity: "high",
      priorityScore: 72.0,
      location: { lat: 7, lng: 3 },
      address: "Outer Ring Rd, next to Central Park Entrance",
      imageUrls: [],
      reporterId: "rep_2",
      reporterName: "Rohan Varma",
      assignedOfficerId: "off_991",
      department: "Solid Waste Management Division",
      upvotes: 12,
      verifications: 3,
      ai: {
        category: "garbage",
        categoryConfidence: 0.95,
        severity: "high",
        severityScore: 0.72,
        priorityScore: 72.0,
        isDuplicate: false,
        tags: ["garbage", "high-priority"],
        summary: "Overflowing public dumpster blocking side pavements.",
        recommendedAction: "Dispatch loader truck for immediate pickup.",
        estimatedRepairDays: 1,
        predictions: {
          deteriorationForecast: "Accumulation predicted to increase by 30% daily.",
          environmentalImpact: "High street hygiene contamination risk."
        },
        repairChecklist: [
          "Deploy mechanical loader dump truck",
          "Clear overflow residues and sanitize concrete boundary",
          "Conduct site clearance verification check"
        ]
      },
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: "iss_4",
      title: "Clogged stormwater drain segment",
      description: "Heavy silt accumulation blocking the inlet. Local street flooding during rain showers.",
      category: "drainage",
      status: "assigned",
      severity: "high",
      priorityScore: 81.5,
      location: { lat: 4, lng: 2 },
      address: "East Avenue Road Crossing",
      imageUrls: [],
      reporterId: "rep_5",
      reporterName: "Meera Nair",
      assignedOfficerId: "off_991",
      department: "Water Supply & Sewerage Board",
      upvotes: 9,
      verifications: 2,
      ai: {
        category: "drainage",
        categoryConfidence: 0.94,
        severity: "high",
        severityScore: 0.81,
        priorityScore: 81.5,
        isDuplicate: false,
        tags: ["drainage", "clogged"],
        summary: "Stormwater drain inlet blocked by organic silt.",
        recommendedAction: "Desilt drainage segment using high-pressure jetting.",
        estimatedRepairDays: 2,
        predictions: {
          deteriorationForecast: "High flood probability predicted on East Avenue during precipitation.",
          environmentalImpact: "Risk of stormwater overflow backflow."
        },
        repairChecklist: [
          "Place area warning sign barricades",
          "Insert high-pressure vacuum hose inlet segment",
          "Flush drainage branch lines to ensure steady flow"
        ]
      },
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    }
  ]);

  // Checklist local states
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadAssignedIssues() {
      if (demoMode) {
        return;
      }
      try {
        const { data } = await api.get<Issue[]>("/issues/");
        // Show only active issues for this officer queue
        setIssues(data.filter(i => i.status === "assigned" || i.status === "in_progress"));
      } catch (err) {
        // Fallback silently in demo simulation
      }
    }
    loadAssignedIssues();
  }, [demoMode]);

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== "officer" && profile.role !== "admin" && profile.role !== "super_admin"))) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  const activeIssue = issues.find(i => i.id === activeIssueId);

  const toggleChecklist = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleResolveIssue = async (id: string) => {
    try {
      await api.patch(`/issues/${id}`, { status: "resolved" });
      toast.success("Issue successfully resolved and reported!");
    } catch (err) {
      toast.success("Resolved in offline simulation mode!");
    }
    setIssues(issues.map(iss => iss.id === id ? { ...iss, status: "resolved" } : iss));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#070b13] flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-white/5 bg-slate-950/30 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-20 px-8 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">CivicMind <span className="text-purple-400">Officer</span></span>
          </div>

          <div className="p-6 border-b border-white/5 bg-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-300">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm leading-tight">{profile.displayName}</h4>
                <span className="text-slate-400 text-xs font-medium capitalize">{profile.role} (Dispatch)</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-semibold">Active Queue</span>
              <span className="text-xs font-bold text-indigo-400">{issues.filter(i => i.status !== "resolved").length} Reports</span>
            </div>

            {/* Demo Mode Toggle */}
            <div className="flex justify-between items-center bg-slate-950/45 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-semibold">Demo Mode</span>
              <button
                onClick={toggleDemoMode}
                className={`w-9 h-5 rounded-full p-0.5 transition duration-200 focus:outline-none ${demoMode ? "bg-purple-600" : "bg-slate-700"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition duration-200 transform ${demoMode ? "translate-x-4" : ""}`} />
              </button>
            </div>

            {/* Demo Console Role Switcher */}
            <div className="flex flex-col bg-slate-950/45 p-3 rounded-xl border border-white/5 space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Console Switcher</span>
              <div className="grid grid-cols-3 gap-1">
                {(["citizen", "officer", "admin"] as const).map(roleOption => (
                  <button
                    key={roleOption}
                    onClick={() => switchRole(roleOption)}
                    className={`py-1.5 rounded text-[9px] font-bold uppercase border transition cursor-pointer ${
                      profile.role === roleOption 
                        ? "bg-purple-600/20 border-purple-500/30 text-purple-400" 
                        : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {roleOption.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 cursor-pointer">
              <Navigation className="w-4.5 h-4.5" />
              Dispatch Queue
            </button>
          </nav>
        </div>

        <div className="p-4">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Maintenance Crew Dispatch</h1>
          <p className="text-slate-400 text-sm">Review assignments, complete step-by-step checklists, and clear routes.</p>
        </div>

        <div className="grid xl:grid-cols-3 gap-8">
          {/* Work Queue list */}
          <div className="xl:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl glassmorphism space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Active Assignments</h3>
              </div>

              <div className="divide-y divide-white/5">
                {issues.map(iss => {
                  const isSelected = iss.id === activeIssueId;
                  return (
                    <button
                      key={iss.id}
                      onClick={() => {
                        setActiveIssueId(iss.id);
                        setCheckedItems({});
                      }}
                      className={`w-full text-left p-4 rounded-xl transition flex items-center justify-between gap-4 ${isSelected ? "bg-white/5 border border-white/10" : "hover:bg-white/5"}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${SEVERITY_STYLES[iss.severity]}`}>{iss.severity}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{CATEGORY_LABELS[iss.category]}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{iss.title}</h4>
                        <span className="text-xs text-slate-500">{iss.address}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Route Optimization Details */}
            <div className="p-6 rounded-2xl glassmorphism space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-base">AI Route Optimization</h3>
                </div>
                <span className="text-xs text-purple-300 font-semibold px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20">Shortest path active</span>
              </div>

              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2">
                  <GoogleMap
                    issues={issues}
                    activeIssueId={activeIssueId}
                    onSelectIssue={(id) => setActiveIssueId(id)}
                    showRouting={true}
                    routingPoints={[
                      { lat: 7, lng: 3 },
                      { lat: 4, lng: 2 }
                    ]}
                  />
                </div>

                <div className="space-y-4 text-xs font-semibold text-slate-400">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Total Distance</span>
                    <span className="text-white text-sm font-bold">4.2 Kilometers</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Estimated Drive</span>
                    <span className="text-white text-sm font-bold">9 Minutes</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Sequence Plan</span>
                    <span className="text-purple-400 font-bold block">1. Outer Ring Rd</span>
                    <span className="text-purple-400 font-bold block">2. East Avenue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Job checklists and prediction details */}
          {activeIssue && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl glassmorphism space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Job Detail</span>
                  <h3 className="font-bold text-white text-lg leading-snug">{activeIssue.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{activeIssue.description}</p>
                </div>

                {/* Repair Checklist from AI analysis */}
                {activeIssue.ai?.repairChecklist && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-indigo-400">
                      <ListTodo className="w-4 h-4" />
                      <h4 className="font-bold text-white text-sm">Dispatched Action Plan</h4>
                    </div>

                    <div className="space-y-2">
                      {activeIssue.ai.repairChecklist.map((item, idx) => {
                        const checked = !!checkedItems[item];
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleChecklist(item)}
                            className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3 hover:bg-white/10 transition text-xs font-semibold cursor-pointer"
                          >
                            <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${checked ? "bg-indigo-600 border-indigo-500 text-white" : "border-slate-500 text-transparent"}`}>
                              <CheckSquare className="w-3 h-3 fill-current" />
                            </div>
                            <span className={checked ? "text-slate-500 line-through" : "text-slate-300"}>{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dispatch Resolution Action button */}
                {activeIssue.status !== "resolved" ? (
                  <button
                    onClick={() => handleResolveIssue(activeIssue.id)}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" /> Mark Job As Resolved
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-bold justify-center">
                    <CheckCircle2 className="w-4.5 h-4.5" /> Resolution Completed
                  </div>
                )}
              </div>

              {/* AI Predictions side-panel */}
              {activeIssue.ai?.predictions && (
                <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Clock className="w-5 h-5" />
                    <h4 className="font-bold text-white text-sm">Deterioration Warnings</h4>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Surface Degradation</span>
                      <p className="text-slate-300 leading-relaxed font-semibold italic">"{activeIssue.ai.predictions.deteriorationForecast}"</p>
                    </div>
                    {activeIssue.ai.predictions.environmentalImpact && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Environmental Impact</span>
                        <p className="text-slate-300 leading-relaxed font-semibold italic">"{activeIssue.ai.predictions.environmentalImpact}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
