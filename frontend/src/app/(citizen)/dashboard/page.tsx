"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, MapPin, ListFilter, PlusCircle, LayoutDashboard, 
  Map, Award, Bell, LogOut, CheckCircle2, ChevronRight 
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { ReportForm } from "@/components/issues/ReportForm";
import { IssueCard } from "@/components/issues/IssueCard";
import GoogleMap from "@/components/maps/GoogleMap";
import { titleCase } from "@/lib/utils";
import type { Issue, IssueCategory, IssueStatus } from "@/types";
import { toast } from "sonner";
import api from "@/lib/api";

const INITIAL_ISSUES: Issue[] = [
  {
    id: "iss_1",
    title: "Deep pothole causing vehicle swerving",
    description: "A hazardous pothole has formed right in the middle of the left lane. Cars are violently swerving to avoid it, creating unsafe conditions.",
    category: "pothole",
    status: "verified",
    severity: "critical",
    priorityScore: 88.5,
    location: { lat: 4, lng: 5 },
    address: "Left lane, Main Street Sector 4",
    imageUrls: [],
    reporterId: "rep_1",
    reporterName: "Ananya Sharma",
    upvotes: 24,
    verifications: 6,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
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
    assignedOfficerId: "off_12",
    department: "Waste Management Division",
    upvotes: 12,
    verifications: 3,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "iss_3",
    title: "Broken streetlight near intersection",
    description: "Lightpole is completely dark. This intersection feels highly unsafe at night for pedestrians.",
    category: "streetlight",
    status: "reported",
    severity: "medium",
    priorityScore: 48.0,
    location: { lat: 2, lng: 8 },
    address: "Corner of Park Ave & 5th Block",
    imageUrls: [],
    reporterId: "rep_3",
    reporterName: "Priya Das",
    upvotes: 8,
    verifications: 1,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

export default function Dashboard() {
  const { profile, loading, logout, updatePoints, demoMode, toggleDemoMode, switchRole } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "report" | "leaderboard">("dashboard");
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  
  // Redirect to login if session is empty
  useEffect(() => {
    if (!loading && !profile) {
      router.push("/login");
    }
  }, [profile, loading, router]);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selection from interactive grid map
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(null);

  // Dynamic API sync based on Demo Mode status
  useEffect(() => {
    async function loadIssues() {
      if (demoMode) {
        setIssues(INITIAL_ISSUES);
        return;
      }
      try {
        const { data } = await api.get<Issue[]>("/issues/");
        setIssues(data);
      } catch (err) {
        toast.error("Failed to load issues from SQLite database. Using demo fallback.");
        setIssues(INITIAL_ISSUES);
      }
    }
    loadIssues();
  }, [demoMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
          <span className="text-slate-400 text-xs font-semibold">Loading console workspace...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Submit handler passed to the report form
  const handleReportSubmit = async (newReport: Omit<Issue, "id" | "reporterId" | "reporterName" | "upvotes" | "verifications" | "createdAt" | "updatedAt">) => {
    const localIssue: Issue = {
      ...newReport,
      id: `iss_${Date.now()}`,
      reporterId: profile?.uid || "user_123",
      reporterName: profile?.displayName || "Citizen Reporter",
      upvotes: 0,
      verifications: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!demoMode) {
      try {
        const { data } = await api.post<Issue>("/issues/", {
          title: newReport.title,
          description: newReport.description,
          category: newReport.category,
          location: {
            lat: newReport.location.lat,
            lng: newReport.location.lng
          },
          address: newReport.address,
          imageUrls: newReport.imageUrls || []
        });
        setIssues(prev => [data, ...prev]);
        toast.success("Issue reported successfully to smart city database!");
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to save on server. Added locally.");
        setIssues(prev => [localIssue, ...prev]);
      }
    } else {
      setIssues(prev => [localIssue, ...prev]);
      toast.success("Issue submitted in Offline Demo Mode.");
    }
    
    updatePoints(25); // Award 25 points for submitting
    setActiveTab("dashboard");
  };

  const handleUpvote = (id: string) => {
    setIssues(issues.map(iss => iss.id === id ? { ...iss, upvotes: iss.upvotes + 1 } : iss));
    updatePoints(5);
  };

  const handleVerify = (id: string) => {
    setIssues(issues.map(iss => {
      if (iss.id === id) {
        const count = iss.verifications + 1;
        const status: IssueStatus = count >= 5 && iss.status === "reported" ? "verified" : iss.status;
        return { ...iss, verifications: count, status };
      }
      return iss;
    }));
    updatePoints(10);
  };

  const filteredIssues = issues.filter(iss => {
    const matchesCat = categoryFilter === "all" || iss.category === categoryFilter;
    const matchesStat = statusFilter === "all" || iss.status === statusFilter;
    return matchesCat && matchesStat;
  });

  return (
    <div className="min-h-screen bg-[#070b13] flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-white/5 bg-slate-950/30 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-20 px-8 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">CivicMind <span className="text-purple-400">AI</span></span>
          </div>

          {/* User Profile Mini Card */}
          {profile && (
            <div className="p-6 border-b border-white/5 bg-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300">
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm leading-tight">{profile.displayName}</h4>
                  <span className="text-slate-400 text-xs font-medium capitalize">{profile.role}</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 font-semibold">Civic Points</span>
                <span className="text-sm font-bold text-purple-400">{profile.points} XP</span>
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
          )}

          <nav className="p-4 space-y-1">
            {[
              { id: "dashboard", label: "Citizen Dashboard", icon: LayoutDashboard },
              { id: "report", label: "File AI Report", icon: PlusCircle },
              { id: "leaderboard", label: "Leaderboard", icon: Award }
            ].map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as "dashboard" | "report" | "leaderboard")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isSelected 
                      ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </button>
              );
            })}
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

      {/* Main Console Workspace */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        {/* Citizen Dashboard Workspace */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Smart City Overview</h1>
                <p className="text-slate-400 text-sm">Monitor issues, verify coordinates, and support municipal dispatches.</p>
              </div>
              <button
                onClick={() => setActiveTab("report")}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-sm font-bold text-white flex items-center gap-2 hover:from-purple-500 hover:to-indigo-400 transition shadow-lg shadow-purple-500/20"
              >
                <PlusCircle className="w-4.5 h-4.5" /> Report Issue
              </button>
            </div>

            {/* Grid Map and Analytics Info */}
            <div className="grid xl:grid-cols-3 gap-8">
              {/* Google Maps Container */}
              <div className="xl:col-span-2 p-6 rounded-2xl glassmorphism space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white text-base">Civic Heatmaps & Incident Maps</h3>
                  </div>
                  <span className="text-xs text-purple-300 font-semibold px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20">Select coordinates on Map to report</span>
                </div>
                
                <GoogleMap
                  issues={issues}
                  selectedCoords={selectedCoords}
                  onSelectCoords={(coords) => {
                    setSelectedCoords(coords);
                    setActiveTab("report");
                    toast.info(`Selected coordinates: Lat ${coords.lat.toFixed(2)}, Lng ${coords.lng.toFixed(2)}`);
                  }}
                  onSelectIssue={(id) => {
                    const clicked = issues.find(i => i.id === id);
                    if (clicked) {
                      toast.info(`Selected issue: ${clicked.title}`);
                    }
                  }}
                />
              </div>

              {/* Quick statistics and side feed panel */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl glassmorphism space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-base">Civic Alerts Feed</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "MG Road Pothole Dispatched", time: "1 hr ago", desc: "Assigned to PWD team for repair." },
                      { title: "Cleanliness Drive Scheduled", time: "4 hrs ago", desc: "Waste collection teams assigned for Sector 5." }
                    ].map((alert, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{alert.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{alert.time}</span>
                        </div>
                        <p className="text-xs text-slate-400">{alert.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-tr from-purple-900/20 to-indigo-900/20 border border-purple-500/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">Earn XP Rewards</span>
                    <h4 className="font-bold text-white text-sm">Verify 5 Open Reports</h4>
                    <p className="text-xs text-slate-400">Receive 'Civic Sentinel' status badge +50 Points.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>

            {/* List Filter Actions */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <ListFilter className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-lg">Active Local Issues</h3>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="pothole">Potholes</option>
                    <option value="garbage">Garbage</option>
                    <option value="water_leakage">Water Leakage</option>
                    <option value="streetlight">Streetlights</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="reported">Reported</option>
                    <option value="verified">Verified</option>
                    <option value="assigned">Assigned</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Issue Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIssues.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onUpvote={handleUpvote}
                    onVerify={handleVerify}
                  />
                ))}
              </div>

              {filteredIssues.length === 0 && (
                <div className="text-center py-16 text-slate-500 font-semibold text-sm">
                  No reports matched selected filters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Form Workspace */}
        {activeTab === "report" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Report Civic Issue</h1>
              <p className="text-slate-400 text-sm">AI vision analysis automatically categorizes and scores severity scale.</p>
            </div>
            
            <ReportForm
              onSubmit={handleReportSubmit}
              onCancel={() => {
                setSelectedCoords(null);
                setActiveTab("dashboard");
              }}
              selectedCoords={selectedCoords}
            />
          </div>
        )}

        {/* Leaderboard Workspace */}
        {activeTab === "leaderboard" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white">Active Leaderboard</h1>
              <p className="text-slate-400 text-sm">Top citizens earning badges and points for active reporting.</p>
            </div>

            <div className="p-6 rounded-2xl glassmorphism overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs text-slate-500 font-semibold tracking-wider">
                    <th className="pb-4">Rank</th>
                    <th className="pb-4">Citizen Name</th>
                    <th className="pb-4 text-center">Reports Verified</th>
                    <th className="pb-4 text-right">XP Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {[
                    { rank: 1, name: "Arjun Patel", count: 24, xp: 620, badge: "Master Inspector" },
                    { rank: 2, name: "Priya Sharma", count: 18, xp: 480, badge: "Pothole Patrol" },
                    { rank: 3, name: "Rohan Das", count: 14, xp: 390, badge: "Community Hero" },
                    { rank: 4, name: "Ananya Iyer", count: 10, xp: 280, badge: "Active Citizen" },
                    { rank: 5, name: "Jerin Patel (You)", count: 4, xp: profile?.points || 120, badge: "Welcome Citizen" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="py-4 font-bold text-slate-400">#{row.rank}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-xs text-purple-300">
                            {row.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white">{row.name}</span>
                            <span className="block text-[10px] text-purple-400 font-bold">{row.badge}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center text-slate-300 font-medium">{row.count}</td>
                      <td className="py-4 text-right font-extrabold text-purple-400">{row.xp} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}