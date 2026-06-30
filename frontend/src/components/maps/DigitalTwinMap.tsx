"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, AlertTriangle, Compass, Map, Activity, 
  TrendingUp, TrafficCone, DollarSign, Sparkles, ChevronRight 
} from "lucide-react";

interface WardData {
  id: string;
  name: string;
  healthScore: number;
  complaintCount: number;
  officersCount: number;
  predictionStatus: string;
  infrastructureRisk: string;
  trafficImpact: string;
  budgetAllocation: string;
  colorClass: string;
  fillColor: string;
  strokeColor: string;
  points: string;
  details: {
    activeIssues: string[];
    aiRecommendations: string[];
    avgResolutionHours: number;
  };
}

export default function DigitalTwinMap() {
  const wards: WardData[] = [
    {
      id: "ward_4",
      name: "Ward 4 (Metro Center)",
      healthScore: 92.0,
      complaintCount: 4,
      officersCount: 3,
      predictionStatus: "Stable",
      infrastructureRisk: "Minimal",
      trafficImpact: "Low",
      budgetAllocation: "$24,000 (Routine)",
      colorClass: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      fillColor: "fill-emerald-500/10 hover:fill-emerald-500/20",
      strokeColor: "stroke-emerald-500",
      points: "150,50 300,50 250,150 100,150",
      details: {
        activeIssues: [
          "Broken street fixture near metro entrance",
          "Flickering streetlight block 4"
        ],
        aiRecommendations: [
          "Schedule routine lighting inspections",
          "Clean stormwater grates before weekend showers"
        ],
        avgResolutionHours: 12
      }
    },
    {
      id: "ward_2",
      name: "Ward 2 (Green Valley)",
      healthScore: 88.5,
      complaintCount: 8,
      officersCount: 2,
      predictionStatus: "Stable",
      infrastructureRisk: "Low",
      trafficImpact: "Medium",
      budgetAllocation: "$42,000 (Preventive)",
      colorClass: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
      fillColor: "fill-yellow-500/10 hover:fill-yellow-500/20",
      strokeColor: "stroke-yellow-500",
      points: "300,50 450,80 400,180 250,150",
      details: {
        activeIssues: [
          "Overflowing community dumpster near central market",
          "Minor pavement shoulder crack"
        ],
        aiRecommendations: [
          "Increase trash pick sweeps on weekends",
          "Apply concrete fillers to pavement cracks to avoid pothole expansion"
        ],
        avgResolutionHours: 18
      }
    },
    {
      id: "ward_3",
      name: "Ward 3 (Riverside Sector)",
      healthScore: 81.0,
      complaintCount: 10,
      officersCount: 2,
      predictionStatus: "Warning",
      infrastructureRisk: "Medium",
      trafficImpact: "Medium",
      budgetAllocation: "$58,000 (Active)",
      colorClass: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
      fillColor: "fill-yellow-500/10 hover:fill-yellow-500/20",
      strokeColor: "stroke-yellow-500",
      points: "100,150 250,150 200,280 50,250",
      details: {
        activeIssues: [
          "Main water conduit pipe joint leakage",
          "Riverwalk pavement shoulder erosion"
        ],
        aiRecommendations: [
          "Replace Riverside joint clamp within 48 hours",
          "Seal Riverwalk bank to prevent asphalt decay"
        ],
        avgResolutionHours: 24
      }
    },
    {
      id: "ward_1",
      name: "Ward 1 (Industrial Zone)",
      healthScore: 74.0,
      complaintCount: 14,
      officersCount: 4,
      predictionStatus: "Warning",
      infrastructureRisk: "High",
      trafficImpact: "High",
      budgetAllocation: "$94,000 (Priority)",
      colorClass: "text-amber-500 border-amber-500/20 bg-amber-500/5",
      fillColor: "fill-amber-500/10 hover:fill-amber-500/20",
      strokeColor: "stroke-amber-500",
      points: "250,150 400,180 350,300 200,280",
      details: {
        activeIssues: [
          "3 deep potholes along heavy cargo lanes",
          "Illegal dumping of industrial masonry debris"
        ],
        aiRecommendations: [
          "Restrict heavy trucks until asphalt cures",
          "Deploy municipal camera traps to stop debris dumpings"
        ],
        avgResolutionHours: 36
      }
    },
    {
      id: "ward_5",
      name: "Ward 5 (South Extension)",
      healthScore: 68.2,
      complaintCount: 19,
      officersCount: 5,
      predictionStatus: "Critical",
      infrastructureRisk: "Critical",
      trafficImpact: "High",
      budgetAllocation: "$120,000 (Emergency)",
      colorClass: "text-rose-500 border-rose-500/20 bg-rose-500/5",
      fillColor: "fill-rose-500/10 hover:fill-rose-500/20",
      strokeColor: "stroke-rose-500",
      points: "50,250 200,280 150,380 20,350",
      details: {
        activeIssues: [
          "Clogged storm drains leading to street flooding",
          "Traffic light failure intersection block 9"
        ],
        aiRecommendations: [
          "Deploy high-pressure water jetters for immediate drainage clears",
          "Replace traffic signal relay logic boards"
        ],
        avgResolutionHours: 48
      }
    }
  ];

  const [activeWardId, setActiveWardId] = useState<string>("ward_5");
  const activeWard = wards.find(w => w.id === activeWardId) || wards[4];

  return (
    <div className="p-6 rounded-2xl glassmorphism space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-bold text-white text-sm">Interactive City Digital Twin</h3>
            <span className="text-[10px] text-slate-400 font-medium block">Live ward layout mapped by AI Health indices</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-center">
        {/* Interactive SVG Wards Plot */}
        <div className="lg:col-span-3 aspect-[4/3] bg-slate-950/60 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-4 relative">
          <svg viewBox="0 0 500 400" className="w-full h-full">
            {wards.map(ward => {
              const isActive = ward.id === activeWardId;
              return (
                <polygon
                  key={ward.id}
                  points={ward.points}
                  onClick={() => setActiveWardId(ward.id)}
                  aria-label={`${ward.name} (Health: ${ward.healthScore}%)`}
                  className={`cursor-pointer transition-all duration-300 stroke-2 ${ward.fillColor} ${ward.strokeColor} ${
                    isActive ? "stroke-[4px] fill-purple-500/20" : ""
                  }`}
                />
              );
            })}
          </svg>
          
          <div className="absolute bottom-4 left-4 text-[9px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
            <Compass className="w-3.5 h-3.5 animate-spin" /> Click ward polygon for detail diagnostics
          </div>
        </div>

        {/* Selected Ward Diagnostics details */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`p-4 rounded-xl border ${activeWard.colorClass} space-y-3`}>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Selected Area</span>
              <h4 className="font-extrabold text-white text-base leading-tight mt-0.5">{activeWard.name}</h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-300">
              <div className="p-2 bg-slate-950/40 rounded-lg border border-white/5 space-y-0.5">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Health Score</span>
                <span className="text-white text-sm font-extrabold">{activeWard.healthScore}%</span>
              </div>
              <div className="p-2 bg-slate-950/40 rounded-lg border border-white/5 space-y-0.5">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Incidents Count</span>
                <span className="text-white text-sm font-extrabold">{activeWard.complaintCount} Reports</span>
              </div>
              <div className="p-2 bg-slate-950/40 rounded-lg border border-white/5 space-y-0.5">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Active Officers</span>
                <span className="text-white text-sm font-extrabold">{activeWard.officersCount} Crews</span>
              </div>
              <div className="p-2 bg-slate-950/40 rounded-lg border border-white/5 space-y-0.5">
                <span className="text-[9px] text-slate-500 uppercase block font-bold">Budget Need</span>
                <span className="text-white text-sm font-extrabold text-indigo-400">{activeWard.budgetAllocation}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold">
                <Activity className="w-3.5 h-3.5" /> Environmental Indicators
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Infrastructure Risk:</span>
                  <span className="text-white font-bold">{activeWard.infrastructureRisk}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Traffic Impact Index:</span>
                  <span className="text-white font-bold">{activeWard.trafficImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Deterioration Rate:</span>
                  <span className="text-white font-bold uppercase">{activeWard.predictionStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI recommendations side list */}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-3">
            <div className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-4 h-4" />
              <h4 className="font-bold text-white text-xs">AI Ward Action Recommendations</h4>
            </div>

            <div className="space-y-2">
              {activeWard.details.aiRecommendations.map((rec, idx) => (
                <div key={idx} className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-semibold text-slate-300 leading-normal flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
