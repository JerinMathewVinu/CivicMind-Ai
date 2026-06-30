"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, Flame, Navigation, ShieldCheck, Landmark, 
  School, HeartPulse, Layers, Compass, Filter, Calendar 
} from "lucide-react";
import type { Issue } from "@/types";

interface GoogleMapProps {
  issues: Issue[];
  onSelectCoords?: (coords: { lat: number; lng: number }) => void;
  selectedCoords?: { lat: number; lng: number } | null;
  activeIssueId?: string | null;
  onSelectIssue?: (id: string) => void;
  showRouting?: boolean;
  routingPoints?: Array<{ lat: number; lng: number }>;
}

export default function GoogleMap({
  issues,
  onSelectCoords,
  selectedCoords,
  activeIssueId,
  onSelectIssue,
  showRouting = false,
  routingPoints = []
}: GoogleMapProps) {
  // Config states
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [layers, setLayers] = useState({
    heatmap: false,
    traffic: false,
    boundaries: true
  });
  
  const [nearbyFilter, setNearbyFilter] = useState<"none" | "hospitals" | "schools" | "police">("none");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Load Google Maps script dynamically if key is available
  useEffect(() => {
    if (!mapApiKey) return;
    if (window.google) {
      setIsGoogleLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=visualization`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleLoaded(true);
    document.head.appendChild(script);
  }, [mapApiKey]);

  // Google Maps Instance initialization
  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: selectedCoords || { lat: 12.9716, lng: 77.5946 }, // Bangalore default
      zoom: 13,
      mapTypeId: mapType === "satellite" ? "hybrid" : "roadmap",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#374151" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1329" }] }
      ]
    });

    // Traffic Layer
    if (layers.traffic) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(mapInstance);
    }

    // Heatmap Layer
    if (layers.heatmap) {
      const heatmapPoints = issues.map(iss => new window.google.maps.LatLng(iss.location.lat, iss.location.lng));
      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapPoints,
        map: mapInstance
      });
    }

    // Plotted issue markers
    issues.forEach(iss => {
      const markerColor = iss.severity === "critical" ? "#ef4444" : (iss.severity === "high" ? "#f59e0b" : "#10b981");
      const pinSvg = {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: markerColor,
        fillOpacity: 1.0,
        strokeWeight: 1,
        scale: 1.5,
        anchor: new window.google.google.maps.Point(12, 22)
      };

      const marker = new window.google.maps.Marker({
        position: { lat: iss.location.lat, lng: iss.location.lng },
        map: mapInstance,
        icon: pinSvg,
        title: iss.title
      });

      marker.addListener("click", () => {
        if (onSelectIssue) onSelectIssue(iss.id);
      });
    });

    // Map Click Listener to select coords
    if (onSelectCoords) {
      mapInstance.addListener("click", (e: any) => {
        onSelectCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
    }

  }, [isGoogleLoaded, issues, selectedCoords, mapType, layers, onSelectCoords, onSelectIssue]);

  // Filters calculation
  const filteredIssues = issues.filter(iss => {
    const matchCat = categoryFilter === "all" || iss.category === categoryFilter;
    const matchSev = severityFilter === "all" || iss.severity === severityFilter;
    const matchStat = statusFilter === "all" || iss.status === statusFilter;
    return matchCat && matchSev && matchStat;
  });

  return (
    <div className="relative w-full h-[480px] bg-slate-950/60 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
      {/* Filters Toolbar */}
      <div className="p-4 bg-slate-950/80 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-purple-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 border border-white/10 text-white outline-none"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Potholes</option>
            <option value="garbage">Garbage</option>
            <option value="water_leakage">Water Leakage</option>
            <option value="streetlight">Streetlights</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 border border-white/10 text-white outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 border border-white/10 text-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayers(l => ({ ...l, heatmap: !l.heatmap }))}
            className={`p-2 rounded-lg border transition ${layers.heatmap ? "bg-purple-600/20 border-purple-500/30 text-purple-400" : "bg-slate-900 border-white/10 text-slate-400"}`}
            title="Toggle Heatmap"
          >
            <Flame className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, traffic: !l.traffic }))}
            className={`p-2 rounded-lg border transition ${layers.traffic ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-400" : "bg-slate-900 border-white/10 text-slate-400"}`}
            title="Toggle Traffic Layer"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Content Workspace */}
      <div className="relative flex-1 bg-slate-950">
        {mapApiKey && isGoogleLoaded ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          /* High fidelity Apple-inspired Fallback map */
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            {/* Grid background representing roads */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-15 pointer-events-none">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-slate-500" />
              ))}
            </div>

            {/* Custom stylized grid boundary rings */}
            <div className="absolute w-[200px] h-[200px] rounded-full border border-purple-500/10" />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-indigo-500/5" />

            {/* Simulated route line for officer portal */}
            {showRouting && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 120 180 L 280 150 L 450 320" fill="none" stroke="#818cf8" strokeWidth="3" strokeDasharray="6" />
                <circle cx="120" cy="180" r="5" fill="#f59e0b" className="animate-pulse" />
                <circle cx="450" cy="320" r="5" fill="#ef4444" className="animate-pulse" />
              </svg>
            )}

            {/* Nearby public services mock points */}
            {nearbyFilter === "hospitals" && (
              <>
                <div className="absolute top-[20%] left-[25%] p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1 text-[9px] font-bold">
                  <HeartPulse className="w-3.5 h-3.5" /> Metro Hospital
                </div>
                <div className="absolute bottom-[20%] right-[30%] p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1 text-[9px] font-bold">
                  <HeartPulse className="w-3.5 h-3.5" /> City Clinic
                </div>
              </>
            )}

            {nearbyFilter === "schools" && (
              <>
                <div className="absolute top-[40%] right-[20%] p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-1 text-[9px] font-bold">
                  <School className="w-3.5 h-3.5" /> St. Mary's School
                </div>
                <div className="absolute bottom-[35%] left-[25%] p-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-1 text-[9px] font-bold">
                  <School className="w-3.5 h-3.5" /> Sector 2 High
                </div>
              </>
            )}

            {nearbyFilter === "police" && (
              <div className="absolute top-[30%] left-[55%] p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-1 text-[9px] font-bold">
                <Landmark className="w-3.5 h-3.5" /> Ward 4 Precinct
              </div>
            )}

            {/* Active Issue Pins */}
            {filteredIssues.map(iss => {
              const markerColor = iss.severity === "critical" ? "bg-red-500 ring-red-500/30" : (iss.severity === "high" ? "bg-amber-500 ring-amber-500/30" : "bg-emerald-500 ring-emerald-500/30");
              // Map simulated coordinates (scaling to percent screen layout)
              const top = `${(iss.location.lat * 8) + 15}%`;
              const left = `${(iss.location.lng * 8) + 15}%`;
              const isActive = iss.id === activeIssueId;

              return (
                <button
                  key={iss.id}
                  onClick={() => onSelectIssue && onSelectIssue(iss.id)}
                  style={{ top, left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition p-1 rounded-xl flex items-center gap-1.5 group z-10 ${isActive ? "bg-slate-900 border border-white/20 scale-110 shadow-xl" : "hover:bg-slate-900/50"}`}
                >
                  <span className={`w-3 h-3 rounded-full ring-4 ${markerColor} ${isActive ? "animate-pulse" : ""}`} />
                  <span className={`text-[10px] text-white font-bold max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all block`}>{iss.title.slice(0, 15)}...</span>
                </button>
              );
            })}

            {/* Selected Coordinates Pin */}
            {selectedCoords && (
              <div
                style={{ top: `${(selectedCoords.lat * 8) + 15}%`, left: `${(selectedCoords.lng * 8) + 15}%` }}
                className="absolute -translate-x-1/2 -translate-y-[100%] text-purple-400 z-20 flex flex-col items-center gap-0.5 animate-bounce pointer-events-none"
              >
                <MapPin className="w-6 h-6 fill-current" />
                <span className="text-[8px] bg-slate-900 border border-purple-500/30 px-1 py-0.5 rounded font-bold">Report Coordinates</span>
              </div>
            )}

            {/* Click Grid Handler Overlay */}
            {!showRouting && onSelectCoords && (
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                {Array.from({ length: 10 }).map((_, r) => 
                  Array.from({ length: 10 }).map((_, c) => (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => onSelectCoords({ lat: r, lng: c })}
                      className="w-full h-full hover:bg-purple-500/5 transition border border-transparent hover:border-purple-500/10 cursor-crosshair"
                    />
                  ))
                )}
              </div>
            )}

            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-white/10 text-[9px] font-bold text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 animate-spin" /> Interactive Canvas Active (No Google Maps API Key found)
            </div>
          </div>
        )}

        {/* Nearby services sidebar widgets */}
        <div className="absolute right-4 top-4 bg-slate-900/95 border border-white/10 p-2.5 rounded-xl space-y-1.5 z-10 w-44">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Nearby Services</span>
          {[
            { id: "hospitals", label: "Hospitals & Clinics", icon: HeartPulse, color: "text-rose-400" },
            { id: "schools", label: "Schools & Colleges", icon: School, color: "text-yellow-400" },
            { id: "police", label: "Police Stations", icon: Landmark, color: "text-blue-400" }
          ].map(serv => (
            <button
              key={serv.id}
              onClick={() => setNearbyFilter(nearbyFilter === serv.id ? "none" : serv.id as any)}
              className={`w-full text-left p-1.5 rounded-lg flex items-center gap-2 text-[10px] font-semibold transition border ${
                nearbyFilter === serv.id ? "bg-white/5 border-white/20 text-white" : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <serv.icon className={`w-3.5 h-3.5 ${serv.color}`} />
              {serv.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
