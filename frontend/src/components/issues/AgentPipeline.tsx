"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, CheckCircle2, Loader2, PlayCircle, Eye, 
  CopyCheck, AlertTriangle, TrendingUp, Landmark, ListChecks 
} from "lucide-react";

interface AgentStep {
  name: string;
  label: string;
  icon: any;
  purpose: string;
  confidence: number;
  duration: number;
  log: string;
}

interface AgentPipelineProps {
  category: string;
  severity: string;
  isSimulating?: boolean;
  onSimulationComplete?: () => void;
  predictions?: any;
  repairChecklist?: string[];
  department?: string;
  priorityScore?: number;
}

export default function AgentPipeline({
  category,
  severity,
  isSimulating = false,
  onSimulationComplete,
  predictions,
  repairChecklist = [],
  department,
  priorityScore = 50
}: AgentPipelineProps) {
  const steps: AgentStep[] = [
    {
      name: "vision",
      label: "Vision Agent",
      icon: Eye,
      purpose: "Inspect visual indicators and defect size scale.",
      confidence: 0.94,
      duration: 180,
      log: `Scan details. Defect detected: ${category} (${severity}).`
    },
    {
      name: "duplicate",
      label: "Duplicate Detector",
      icon: CopyCheck,
      purpose: "Cross-reference coordinates list to find duplicates.",
      confidence: 0.88,
      duration: 110,
      log: "Coordinates checked. No overlapping duplicate records."
    },
    {
      name: "priority",
      label: "Priority Assessor",
      icon: AlertTriangle,
      purpose: "Calculate risk parameters and safety priorities.",
      confidence: 0.95,
      duration: 220,
      log: `Priority index calculated: ${priorityScore} (${severity}).`
    },
    {
      name: "prediction",
      label: "Prediction Agent",
      icon: TrendingUp,
      purpose: "Compute infrastructure deterioration risks.",
      confidence: 0.90,
      duration: 140,
      log: predictions?.deteriorationForecast || "Degradation rate stable (+10% weekly)."
    },
    {
      name: "department",
      label: "Department Router",
      icon: Landmark,
      purpose: "Route report to responsible municipal branch.",
      confidence: 0.96,
      duration: 90,
      log: `Routed to: ${department || "PWD"}`
    },
    {
      name: "planner",
      label: "Crew Planner Agent",
      icon: ListChecks,
      purpose: "Generate step-by-step action dispatch checklists.",
      confidence: 0.92,
      duration: 130,
      log: `Checklist compiled containing ${repairChecklist.length || 3} operations.`
    }
  ];

  const [activeStepIndex, setActiveStepIndex] = useState(isSimulating ? 0 : steps.length);

  useEffect(() => {
    if (!isSimulating) {
      setActiveStepIndex(steps.length);
      return;
    }

    setActiveStepIndex(0);
    const intervals: NodeJS.Timeout[] = [];

    // Simulate each agent starting and finishing in sequence
    steps.forEach((step, idx) => {
      const delay = steps.slice(0, idx).reduce((acc, s) => acc + s.duration + 500, 0);
      const timer = setTimeout(() => {
        setActiveStepIndex(idx + 1);
        if (idx === steps.length - 1 && onSimulationComplete) {
          onSimulationComplete();
        }
      }, delay + step.duration);
      intervals.push(timer);
    });

    return () => intervals.forEach(clearTimeout);
  }, [isSimulating]);

  return (
    <div className="p-6 rounded-2xl glassmorphism space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <div>
            <h3 className="font-bold text-white text-sm">AI Cooperating Agent Pipeline</h3>
            <span className="text-[10px] text-slate-400 font-medium block">Independent models collaborating in real-time</span>
          </div>
        </div>
        {isSimulating && activeStepIndex < steps.length && (
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded flex items-center gap-1.5 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Orchestrator active
          </span>
        )}
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isCompleted = activeStepIndex > idx;
          const isActive = activeStepIndex === idx;
          const isPending = activeStepIndex < idx;
          const Icon = step.icon;

          return (
            <div 
              key={step.name} 
              className={`p-4 rounded-xl border transition-all-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isActive 
                  ? "bg-purple-950/30 border-purple-500/40 shadow-lg shadow-purple-500/10 scale-[1.01]" 
                  : (isCompleted 
                      ? "bg-emerald-950/5 border-emerald-500/10 shadow-sm shadow-emerald-500/5" 
                      : "bg-slate-900/10 border-transparent opacity-30")
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg transition-all-300 ${isActive ? "bg-purple-500/20 text-purple-400 animate-pulse-glow" : (isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-500")}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-xs">{step.label}</h4>
                    {isCompleted && (
                      <span className="text-[8px] text-slate-500 font-semibold">{step.duration}ms</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{step.purpose}</p>
                  {isCompleted && (
                    <p className="text-[9px] text-purple-300 font-semibold italic mt-1 leading-snug">"{step.log}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 text-right">
                {isCompleted ? (
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold block">CONFIDENCE</span>
                    <span className="text-emerald-400 font-extrabold text-xs">{(step.confidence * 100).toFixed(0)}%</span>
                  </div>
                ) : (
                  isActive ? (
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700" />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
