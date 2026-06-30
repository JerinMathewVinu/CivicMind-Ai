import type { IssueCategory, IssueStatus, Severity } from "@/types";

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole: "Pothole",
  garbage: "Garbage",
  water_leakage: "Water Leakage",
  streetlight: "Streetlight",
  road_crack: "Road Crack",
  drainage: "Drainage",
  traffic_signal: "Traffic Signal",
  illegal_dumping: "Illegal Dumping",
  tree_fallen: "Tree Fallen",
  flooding: "Flooding",
  public_infrastructure: "Public Infrastructure",
};

export const SEVERITY_STYLES: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export const STATUS_STYLES: Record<IssueStatus, string> = {
  reported: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  ai_triaged: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  assigned: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  verified: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  rejected: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  duplicate: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
};