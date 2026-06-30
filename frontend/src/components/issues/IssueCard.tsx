import React from "react";
import { MapPin, ThumbsUp, ShieldCheck, Clock } from "lucide-react";
import { CATEGORY_LABELS, SEVERITY_STYLES, STATUS_STYLES } from "@/lib/constants";
import { titleCase, formatDate } from "@/lib/utils";
import type { Issue } from "@/types";

interface IssueCardProps {
  issue: Issue;
  onUpvote: (id: string) => void;
  onVerify: (id: string) => void;
}

export function IssueCard({ issue, onUpvote, onVerify }: IssueCardProps) {
  const severityGlows = {
    critical: "glow-critical hover:shadow-red-500/10",
    high: "glow-high hover:shadow-amber-500/10",
    medium: "glow-medium hover:shadow-yellow-500/5",
    low: "glow-low hover:shadow-emerald-500/5"
  };
  const activeGlow = severityGlows[issue.severity] || "";

  return (
    <div className={`rounded-2xl glassmorphism p-6 flex flex-col justify-between transition-all-300 relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl ${activeGlow}`}>
      {/* Priority Gradient Background indicator */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" 
        style={{
          backgroundImage: `linear-gradient(to right, ${
            issue.severity === "critical" ? "#ef4444, #f97316" :
            issue.severity === "high" ? "#f97316, #f59e0b" :
            issue.severity === "medium" ? "#eab308, #6366f1" : "#10b981, #3b82f6"
          })`
        }}
      />

      <div className="space-y-4">
        {/* Category and status pill indicators */}
        <div className="flex justify-between items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {CATEGORY_LABELS[issue.category]}
          </span>
          <div className="flex gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${SEVERITY_STYLES[issue.severity]}`}>
              {issue.severity}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[issue.status]}`}>
              {titleCase(issue.status)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-white group-hover:text-purple-300 transition duration-300 text-sm leading-snug">
            {issue.title}
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
            {issue.description}
          </p>
        </div>

        {/* Location descriptor */}
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium leading-tight">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{issue.address}</span>
        </div>

        {/* Dispatch indicators */}
        {issue.department && (
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Dispatched Department</span>
            <span className="text-xs font-semibold text-slate-300">{issue.department}</span>
          </div>
        )}

        {/* Mock AI summary block */}
        {issue.ai && (
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-1 text-xs">
            <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block">AI Response Plan</span>
            <p className="text-[11px] text-purple-300 leading-relaxed italic">"{issue.ai.summary}"</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold pt-1">
              <Clock className="w-3 h-3" /> Est. repair: {issue.ai.estimatedRepairDays} days
            </div>
          </div>
        )}
      </div>

      {/* Verification actions footer */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-5">
        <span className="text-[10px] text-slate-500 font-medium">
          {formatDate(issue.createdAt)}
        </span>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onUpvote(issue.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-purple-500/10 hover:text-purple-300 transition text-xs font-bold text-slate-400 border border-white/5 cursor-pointer"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            {issue.upvotes}
          </button>

          <button 
            onClick={() => onVerify(issue.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-300 transition text-xs font-bold text-slate-400 border border-white/5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verify ({issue.verifications})
          </button>
        </div>
      </div>
    </div>
  );
}