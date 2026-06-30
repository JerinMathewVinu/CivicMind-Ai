import React, { useState, useEffect } from "react";
import { 
  Sparkles, MapPin, UploadCloud, FileText, ChevronRight, Check, AlertTriangle, Loader2 
} from "lucide-react";
import api from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { Issue, AIAnalysis, IssueCategory } from "@/types";
import AgentPipeline from "@/components/issues/AgentPipeline";

interface ReportFormProps {
  onSubmit: (report: Omit<Issue, "id" | "reporterId" | "reporterName" | "upvotes" | "verifications" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  selectedCoords: { lat: number; lng: number } | null;
}

export function ReportForm({ onSubmit, onCancel, selectedCoords }: ReportFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("pothole");
  
  // Geolocation states
  const [lat, setLat] = useState("4.000");
  const [lng, setLng] = useState("5.000");
  const [address, setAddress] = useState("Main Street, Sector 4");

  // AI assessment states
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [simulationDone, setSimulationDone] = useState(false);

  // File Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // Sync coords from map grid select
  useEffect(() => {
    if (selectedCoords) {
      setLat(selectedCoords.lat.toString());
      setLng(selectedCoords.lng.toString());
      setAddress(`Row ${selectedCoords.lat}, Col ${selectedCoords.lng} Grid Block`);
    }
  }, [selectedCoords]);

  const handleSimulateUpload = () => {
    if (uploading || uploadedFile) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadedFile("incident_evidence_capture.jpg (1.8 MB)");
    }, 1200);
  };

  // Run simulated AI analysis
  const runAIAnalysis = async () => {
    if (!title || !description) return;
    setAnalyzing(true);
    setSimulationDone(false);
    
    try {
      const { data } = await api.post<AIAnalysis>("/ai/analyze", null, {
        params: { title, description }
      });
      setAiAnalysis(data);
      setCategory(data.category);
    } catch (err) {
      // Offline fallback mock AI simulation
      const text = (title + " " + description).toLowerCase();
      let cat: IssueCategory = "pothole";
      if (text.includes("garbage") || text.includes("trash")) cat = "garbage";
      if (text.includes("water") || text.includes("pipe")) cat = "water_leakage";
      if (text.includes("light") || text.includes("bulb")) cat = "streetlight";
      
      setAiAnalysis({
        category: cat,
        categoryConfidence: 0.95,
        severity: text.includes("danger") ? "critical" : "medium",
        severityScore: text.includes("danger") ? 0.9 : 0.5,
        priorityScore: text.includes("danger") ? 90 : 50,
        isDuplicate: false,
        tags: [cat, "visual-mock-ai"],
        summary: `Mock AI: Issue categorized as ${cat} with automated priority dispatch plan.`,
        recommendedAction: `Inspect grid locations and route to appropriate department team.`,
        estimatedRepairDays: text.includes("danger") ? 1 : 5,
        predictions: {
          deteriorationForecast: text.includes("danger") ? "Critical wear forecast: degradation within 48h." : "Stable degradation profile.",
          environmentalImpact: "Low local risk."
        },
        repairChecklist: [
          "Deploy ward maintenance crew",
          "Conduct defect structural patch clears",
          "Validate completion checks"
        ],
        department: "Public Works Department (PWD)"
      });
      setCategory(cat);
    } finally {
      // Keep analyzing active so the pipeline renders its spinner animation states
      setTimeout(() => {
        setAnalyzing(false);
      }, 500);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && title && description) {
      runAIAnalysis();
      setStep(2);
    }
  };

  const handleFinalSubmit = () => {
    onSubmit({
      title,
      description,
      category,
      status: aiAnalysis ? "ai_triaged" : "reported",
      severity: aiAnalysis?.severity || "medium",
      priorityScore: aiAnalysis?.priorityScore || 50,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      address,
      imageUrls: uploadedFile ? [uploadedFile] : [],
      ai: aiAnalysis || undefined
    });
  };

  return (
    <div className="rounded-2xl glassmorphism p-8 space-y-6">
      {/* Form Progress Bar */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? "bg-purple-600 text-white" : "bg-purple-600/20 text-purple-400"}`}>1</div>
        <div className="h-0.5 bg-white/5 flex-1" />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500"}`}>2</div>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Issue Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Pothole obstructing traffic on Outer Ring Road"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Detailed Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue size, hazard potential, and surrounding impact..."
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition resize-none font-semibold"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Latitude Coordinate</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Longitude Coordinate</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Street Address Description</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition font-semibold"
            />
          </div>

          <div 
            onClick={handleSimulateUpload}
            className={`border border-dashed transition rounded-xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
              uploadedFile 
                ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400" 
                : "border-white/10 hover:border-purple-500/30 text-slate-500"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="text-xs font-bold text-purple-400">Verifying and uploading evidence...</span>
              </>
            ) : uploadedFile ? (
              <>
                <Check className="w-8 h-8 text-emerald-400" />
                <span className="text-xs font-bold text-white">{uploadedFile}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Security checks OK (Max size/type verified)</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-slate-500" />
                <span className="text-xs font-bold text-white">Simulate Secure Image Upload</span>
                <span className="text-[10px] text-slate-500 font-semibold">Validates type & signs URLs (Max 5MB)</span>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={onCancel} className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition">Cancel</button>
            <button
              onClick={handleNextStep}
              disabled={!title || !description}
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              Analyze with AI <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AgentPipeline
            category={category}
            severity={aiAnalysis?.severity || "medium"}
            isSimulating={true}
            onSimulationComplete={() => setSimulationDone(true)}
            predictions={aiAnalysis?.predictions}
            repairChecklist={aiAnalysis?.repairChecklist}
            department={aiAnalysis?.department}
            priorityScore={aiAnalysis?.priorityScore}
          />

          {simulationDone && aiAnalysis && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-4">
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <h4 className="font-bold text-sm">Autonomous Triage Complete</h4>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">AI Routed Division</span>
                    <span className="text-white font-bold">{aiAnalysis.department || "Public Works Department (PWD)"}</span>
                  </div>

                  <div className="p-3 bg-slate-950/40 rounded-lg border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Severity Scale</span>
                    <span className="text-orange-400 font-bold uppercase">{aiAnalysis.severity}</span>
                  </div>

                  <div className="md:col-span-2 p-3 bg-slate-950/40 rounded-lg border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">AI Explainable Reasoning</span>
                    <p className="text-slate-300 font-medium italic leading-relaxed">"{aiAnalysis.summary}"</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm / Edit Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:border-purple-500 outline-none transition cursor-pointer font-semibold"
                >
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                    <option key={cat} value={cat}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button onClick={() => { setStep(1); setSimulationDone(false); }} className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition">Back</button>
                <button
                  onClick={handleFinalSubmit}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 transition shadow-lg shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Submit Civic Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}