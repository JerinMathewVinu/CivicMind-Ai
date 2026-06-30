"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, TrendingUp, AlertTriangle, ShieldCheck, PieChart, 
  Map, DollarSign, FileText, ChevronRight, LayoutDashboard, LogOut, Loader2 
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import GoogleMap from "@/components/maps/GoogleMap";
import DigitalTwinMap from "@/components/maps/DigitalTwinMap";
import type { Issue } from "@/types";

interface SummaryData {
  city_health_score: number;
  total_issues: number;
  resolved_issues: number;
  pending_issues: number;
  active_officers: number;
  efficiency_rate: string;
  by_category: Record<string, number>;
  department_performance: Array<{ name: string; resolved: number; pending: number; efficiency: string; avgDays: number }>;
  ward_rankings: Array<{ ward: string; score: number; active: number }>;
  resolution_trends: Array<{ week: string; reported: number; resolved: number }>;
  predictive_insights: {
    road_deterioration: string;
    flood_risk: string;
    garbage_hotspots: string;
    department_overloads: Array<{ department: string; warning: string }>;
  };
}

interface AIReportData {
  report_id: string;
  generated_at: string;
  executive_summary: string;
  recommended_budget_allocation: Record<string, string>;
}

export default function AdminDashboard() {
  const { profile, loading, logout, demoMode, toggleDemoMode, switchRole } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState<AIReportData | null>(null);

  // NLP Search Console states
  const [nlpQuery, setNlpQuery] = useState("");
  const [nlpQuerying, setNlpQuerying] = useState(false);
  const [nlpAnswer, setNlpAnswer] = useState("");
  const [filteredIssueIds, setFilteredIssueIds] = useState<string[] | null>(null);

  // Map Command Tabs
  const [mapTab, setMapTab] = useState<"incidents" | "twin">("incidents");

  // Incidents list for map plots
  const [issues, setIssues] = useState<Issue[]>([
    {
  id: "iss_1",
  title: "Deep pothole causing vehicle swerving",
  description: "A hazardous pothole has formed right in the middle of the left lane.",
  category: "pothole",
  status: "reported",
  severity: "critical",
  priorityScore: 88.5,
  location: { lat: 4, lng: 5 },
  address: "Main Street Sector 4",
  imageUrls: [],
  reporterId: "rep_1",
  reporterName: "Ananya Sharma",
  upvotes: 12,
  verifications: 8,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
},
    {
  id: "iss_2",
  title: "Overflowing garbage disposal near park",
  description: "Public bin is completely overflowing. Garbage has spilled onto the sidewalk.",
  category: "garbage",
  status: "assigned",
  severity: "high",
  priorityScore: 72.0,
  location: { lat: 7, lng: 3 },
  address: "Outer Ring Rd",
  imageUrls: [],
  reporterId: "rep_2",
  reporterName: "Rohan Varma",
  upvotes: 7,
  verifications: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
  ]);

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== "admin" && profile.role !== "super_admin"))) {
      router.push("/login");
    }
  }, [profile, loading, router]);

  useEffect(() => {
    async function loadIssues() {
      if (demoMode) {
        return;
      }
      try {
        const { data } = await api.get<Issue[]>("/issues/");
        setIssues(data);
      } catch (err) {
        // Fallback
      }
    }
    loadIssues();
  }, [demoMode]);

  useEffect(() => {
    async function fetchSummary() {
      if (demoMode) {
        setData({
          city_health_score: 82.4,
          total_issues: 124,
          resolved_issues: 84,
          pending_issues: 40,
          active_officers: 8,
          efficiency_rate: "87.5%",
          by_category: { pothole: 42, garbage: 31, water_leakage: 18, streetlight: 20, other: 13 },
          department_performance: [
            { name: "Public Works Department (PWD)", resolved: 38, pending: 12, efficiency: "76%", avgDays: 3.4 },
            { name: "Solid Waste Management Division", resolved: 28, pending: 10, efficiency: "73%", avgDays: 1.2 },
            { name: "Water Supply & Sewerage Board", resolved: 12, pending: 8, efficiency: "60%", avgDays: 2.8 },
            { name: "Municipal Electrical Division", resolved: 6, pending: 10, efficiency: "37%", avgDays: 4.1 }
          ],
          ward_rankings: [
            { ward: "Ward 4 (Metro Center)", score: 92.0, active: 4 },
            { ward: "Ward 2 (Green Valley)", score: 88.5, active: 8 },
            { ward: "Ward 1 (Industrial Zone)", score: 74.0, active: 14 },
            { ward: "Ward 5 (South Extension)", score: 68.2, active: 19 }
          ],
          resolution_trends: [
            { week: "Week 1", reported: 24, resolved: 18 },
            { week: "Week 2", reported: 32, resolved: 26 },
            { week: "Week 3", reported: 28, resolved: 30 },
            { week: "Week 4", reported: 40, resolved: 34 }
          ],
          predictive_insights: {
            road_deterioration: "Ward 1 Industrial Zone is predicted to see a 35% increase in road surface fractures within 10 days due to heavy vehicle load clusters.",
            flood_risk: "High backflow probability detected at Sector 4 Lowlands: 4 active drainage blockages matching storm weather models indicate local flood risk.",
            garbage_hotspots: "Garbage disposal accumulation trends indicate a rising hotspot near Sector 2 Park Entrance.",
            department_overloads: [
              { department: "Municipal Electrical Division", warning: "Overload high: 10 pending streetlights. Repair capacity exceeded by 25%." }
            ]
          }
        });
        return;
      }
      try {
        const res = await api.get<SummaryData>("/analytics/summary");
        setData(res.data);
      } catch (err) {
        toast.error("Failed to query live dashboard summary stats from database.");
      }
    }
    if (profile) fetchSummary();
  }, [profile, demoMode]);

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await api.get<AIReportData>("/analytics/ai-report");
      setAiReport(res.data);
      toast.success("Executive AI Report compiled successfully!");
    } catch (err) {
      setTimeout(() => {
        setAiReport({
          report_id: "rep_ai_991",
          generated_at: new Date().toISOString(),
          executive_summary: "CivicMind AI executive summary report: City infrastructure health is currently stable at 82.4/100. Pothole repairs are proceeding with high efficiency (76%), but stormwater drainage blockages in Ward 5 require emergency crew dispatches to avoid flood backflows. Waste management accumulation hotspots have been identified in Sector 2, recommending a daily sweep rescheduling.",
          recommended_budget_allocation: {
            "road_maintenance": "Increase by 15% (focused on Ward 1)",
            "drainage_infrastructure": "Increase by 25% (storm emergency readiness)",
            "electrical_grid": "Redistribute 5% workload to subcontracted crew"
          }
        });
        toast.success("AI Report compiled in offline simulation mode!");
      }, 1500);
    } finally {
      setTimeout(() => setGeneratingReport(false), 1500);
    }
  };

  const handleNLPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpQuery) return;
    setNlpQuerying(true);
    try {
      const res = await api.get(`/analytics/query?q=${encodeURIComponent(nlpQuery)}`);
      setNlpAnswer(res.data.answer);
      setFilteredIssueIds(res.data.matchingIds);
      toast.success("NLP query verified successfully!");
    } catch (err) {
      // Offline fallback mock classification
      setNlpQuerying(false);
      const q = nlpQuery.toLowerCase();
      let ans = "No matching items found.";
      let ids: string[] = [];
      if (q.includes("critical") || q.includes("pothole")) {
        ans = "Found 1 critical pothole in Sector 4 assigned to PWD.";
        ids = ["iss_1"];
      } else if (q.includes("garbage")) {
        ans = "Found 1 high priority garbage report near Outer Ring Rd.";
        ids = ["iss_2"];
      }
      setNlpAnswer(ans);
      setFilteredIssueIds(ids);
      toast.success("Query parsed in offline simulation mode!");
    } finally {
      setNlpQuerying(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  // Filter issues based on NLP query matches
  const mapIssues = filteredIssueIds 
    ? issues.filter(i => filteredIssueIds.includes(i.id))
    : issues;

  return (
    <div className="min-h-screen bg-[#070b13] flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-white/5 bg-slate-950/30 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-20 px-8 flex items-center gap-3 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">CivicMind <span className="text-purple-400">Admin</span></span>
          </div>

          <div className="p-6 border-b border-white/5 bg-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300">
              {profile?.displayName?.slice(0, 2).toUpperCase() || "AD"}
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm leading-tight">{profile?.displayName || "Administrator"}</h4>
                <span className="text-slate-400 text-xs font-medium capitalize">{profile?.role || "admin"}</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-semibold">City Score</span>
              <span className="text-xs font-bold text-emerald-400">{data.city_health_score}/100 Healthy</span>
            </div>

            {/* Demo Mode Toggle */}
            <div className="flex justify-between items-center bg-slate-950/45 p-3 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400 font-semibold">Demo Mode</span>
              <button
                onClick={toggleDemoMode}
                className={`w-9 h-5 rounded-full p-0.5 transition duration-200 focus:outline-none ${demoMode ? "bg-purple-600" : "bg-slate-700"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition duration-205 transform ${demoMode ? "translate-x-4" : ""}`} />
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
                      profile?.role === roleOption
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
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-purple-600/10 text-purple-400 border border-purple-500/20 cursor-pointer">
              <LayoutDashboard className="w-4.5 h-4.5" />
              Monitoring Center
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Smart City Command Console</h1>
            <p className="text-slate-400 text-sm">Monitor ward metrics, allocate budgets, and audit predictive forecasts.</p>
          </div>
          <button
            onClick={generateReport}
            disabled={generatingReport}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-xs font-bold text-white flex items-center gap-2 hover:from-purple-500 hover:to-indigo-400 transition shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
          >
            {generatingReport ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Compiling Report...
              </>
            ) : (
              <>
                <FileText className="w-4.5 h-4.5" /> Compile Executive Report
              </>
            )}
          </button>
        </div>

        {/* NLP Search Console */}
        <div className="p-6 rounded-2xl glassmorphism space-y-4">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">AI Natural Language Command Bar</span>
          <form onSubmit={handleNLPSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={nlpQuery}
              onChange={(e) => setNlpQuery(e.target.value)}
              placeholder="Ask me: 'Show all critical potholes' or 'Which department has the highest workload?'"
              className="flex-1 px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={nlpQuerying}
              className="px-5 py-3.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {nlpQuerying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Query Command"}
            </button>
          </form>
          {nlpAnswer && (
            <div className="p-4 bg-purple-950/20 border border-purple-500/10 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 font-bold">Assistant Answer:</span>
                {filteredIssueIds && (
                  <button 
                    onClick={() => {
                      setFilteredIssueIds(null);
                      setNlpAnswer("");
                      setNlpQuery("");
                    }} 
                    className="text-[9px] text-purple-300 hover:underline font-bold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed italic">"{nlpAnswer}"</p>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "City Health Score", value: `${data.city_health_score}%`, desc: "Integrates resolution latency", color: "text-emerald-400" },
            { label: "Active Incidents", value: data.pending_issues, desc: "Awaiting dispatch or in progress", color: "text-amber-400" },
            { label: "Closed Incidents", value: data.resolved_issues, desc: "Successfully resolved & verified", color: "text-emerald-400" },
            { label: "AI Dispatch Accuracy", value: data.efficiency_rate, desc: "Correct category/priority triage", color: "text-purple-400" }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl glassmorphism space-y-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">{stat.label}</span>
              <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <span className="text-[10px] text-slate-400 block leading-tight font-medium">{stat.desc}</span>
            </div>
          ))}
        </div>

        {/* Dynamic AI Report Section */}
        {aiReport && (
          <div className="p-8 rounded-3xl bg-gradient-to-tr from-purple-900/25 to-indigo-900/25 border border-purple-500/10 space-y-6">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="font-extrabold text-base text-white">AI-Generated City Health Report</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-2">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Executive Summary</span>
                <p className="text-slate-300 text-xs leading-relaxed italic">"{aiReport.executive_summary}"</p>
              </div>

              <div className="space-y-3">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">AI Budget Recommendations</span>
                <div className="space-y-2 text-[11px] font-semibold">
                  {Object.entries(aiReport.recommended_budget_allocation).map(([item, desc], idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950/40 rounded-lg border border-white/5 space-y-0.5">
                      <span className="text-white capitalize block">{item.replace("_", " ")}</span>
                      <span className="text-purple-400 block">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid xl:grid-cols-3 gap-8">
          {/* Department Performance and Resolution trends */}
          <div className="xl:col-span-2 space-y-8">
            {/* Spatial Command Tabs */}
            <div className="p-6 rounded-2xl glassmorphism space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Map className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Spatial Command Center</h3>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-lg border border-white/5 text-[10px] font-bold">
                  <button
                    onClick={() => setMapTab("incidents")}
                    className={`px-3 py-1.5 rounded-md transition ${mapTab === "incidents" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    Incident Heatmap
                  </button>
                  <button
                    onClick={() => setMapTab("twin")}
                    className={`px-3 py-1.5 rounded-md transition ${mapTab === "twin" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    Digital Twin Wards
                  </button>
                </div>
              </div>
              
              {mapTab === "incidents" ? (
                <GoogleMap
                  issues={mapIssues}
                  onSelectIssue={(id) => toast.info(`Viewing ticket: ${id}`)}
                />
              ) : (
                <DigitalTwinMap />
              )}
            </div>

            <div className="p-6 rounded-2xl glassmorphism space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Department Dispatch Efficiency</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500">
                      <th className="pb-3">Division Name</th>
                      <th className="pb-3 text-center">Resolved</th>
                      <th className="pb-3 text-center">Pending</th>
                      <th className="pb-3 text-center">Efficiency</th>
                      <th className="pb-3 text-right">Avg. Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {data.department_performance.map((dept, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition">
                        <td className="py-3.5 text-white font-bold">{dept.name}</td>
                        <td className="py-3.5 text-center">{dept.resolved}</td>
                        <td className="py-3.5 text-center">{dept.pending}</td>
                        <td className="py-3.5 text-center text-purple-400 font-extrabold">{dept.efficiency}</td>
                        <td className="py-3.5 text-right font-bold text-slate-400">{dept.avgDays} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ward Rankings */}
            <div className="p-6 rounded-2xl glassmorphism space-y-4">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Ward Health & Rankings</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {data.ward_rankings.map((ward, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{ward.ward}</h4>
                      <span className="text-[10px] text-slate-500 font-bold block">{ward.active} Active Reports</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-400 block">{ward.score}%</span>
                      <span className="text-[9px] text-slate-500 font-semibold block uppercase">Health index</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Predictive AI Alerts Feed */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glassmorphism space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-white text-base">AI Predictive Alerts</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block">Road Degradation Warning</span>
                  <p className="text-slate-300 leading-relaxed font-semibold">{data.predictive_insights.road_deterioration}</p>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block">Flooding Risk Advisory</span>
                  <p className="text-slate-300 leading-relaxed font-semibold">{data.predictive_insights.flood_risk}</p>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest block">Waste Hotspot Cluster</span>
                  <p className="text-slate-300 leading-relaxed font-semibold">{data.predictive_insights.garbage_hotspots}</p>
                </div>
              </div>
            </div>

            {/* Department Overloads warnings */}
            {data.predictive_insights.department_overloads.length > 0 && (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Critical Crew Warning</span>
                  <h4 className="font-bold text-white text-xs">{data.predictive_insights.department_overloads[0].department}</h4>
                  <p className="text-slate-400 leading-tight">{data.predictive_insights.department_overloads[0].warning}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0 animate-bounce" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
