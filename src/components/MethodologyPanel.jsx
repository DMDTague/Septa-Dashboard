import React from 'react';
import { ExternalLink, Database, Map as MapIcon, FileJson, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

const MethodologyPanel = () => {
  const sources = [
    {
      name: "SEPTA TransitView API",
      provides: "Real-time bus and trolley positions, delay offsets, vehicle IDs, next stop name",
      format: "REST JSON API",
      refresh: "15 seconds",
      icon: FileJson,
      url: "https://www3.septa.org/api/TransitViewAll/index.php"
    },
    {
      name: "SEPTA TrainView API",
      provides: "Real-time Regional Rail train locations, late status in minutes, destination, track #",
      format: "REST JSON API",
      refresh: "15 seconds",
      icon: FileJson,
      url: "https://www3.septa.org/api/TrainView/index.php"
    },
    {
      name: "SEPTA ArcGIS Open Data Hub",
      provides: "Geospatial layers, route polyline geometry, stop locations, census tract aggregations",
      format: "GeoJSON / FeatureServer",
      refresh: "Quarterly / Annual",
      icon: MapIcon,
      url: "https://data-septa.opendata.arcgis.com/"
    },
    {
      name: "OpenDataPhilly Portal",
      provides: "Average Daily Ridership by Mode, Route-level statistics, Financial projections",
      format: "CSV / Open Data",
      refresh: "Annual",
      icon: Database,
      url: "https://opendataphilly.org/datasets/septa-ridership-statistics/"
    }
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-800 overflow-hidden space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#005DAA] via-blue-900 to-slate-900 p-6 text-white border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <Cpu size={22} className="text-blue-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading">Data Provenance & Methodology</h2>
            <p className="text-blue-200 text-xs font-mono">Official Open Data Documentation & Mathematical Definitions</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Section 1: Primary Data Sources */}
        <div>
          <h3 className="text-base font-bold text-slate-100 font-heading mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database size={18} className="text-[#005DAA]" />
            Live & Historical API Endpoints
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((source, idx) => {
              const Icon = source.icon;
              return (
                <div key={idx} className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                        <Icon size={16} className="text-[#005DAA]" />
                        {source.name}
                      </div>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors" title="Open source documentation">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">{source.provides}</p>
                  </div>
                  <div className="flex gap-2 text-[11px] font-mono text-slate-300 pt-3 border-t border-slate-800/80">
                    <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                      {source.format}
                    </span>
                    <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">
                      {source.refresh}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Mathematical Definitions */}
        <div>
          <h3 className="text-base font-bold text-slate-100 font-heading mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            Analytical Formulas & Thresholds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-blue-400 uppercase text-[11px]">Mode Recovery Rate</h4>
              <p className="text-slate-300 text-[11px]">
                <code>(Avg Daily Ridership / 2019 Baseline) × 100</code>
              </p>
              <p className="text-[10px] text-slate-500 font-sans">Quantifies long-term post-pandemic ridership retention per transit mode.</p>
            </div>
            
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase text-[11px]">On-Time Standard</h4>
              <p className="text-slate-300 text-[11px]">
                <code>Late Offset ≤ 5 Minutes</code>
              </p>
              <p className="text-[10px] text-slate-500 font-sans">Standard SEPTA metric. Trains/buses within 5 minutes of schedule count as on-time.</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 uppercase text-[11px]">Census Tract Buckets</h4>
              <p className="text-slate-300 text-[11px]">
                Cold (&lt;50), Standard (50-1k), High (1k+)
              </p>
              <p className="text-[10px] text-slate-500 font-sans">Buckets census tracts by boardings+alightings to isolate high-priority corridors.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Limitations & Disclaimers */}
        <div>
          <h3 className="text-base font-bold text-slate-100 font-heading mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldAlert size={18} className="text-[#EF3E42]" />
            Dataset Limitations & Caveats
          </h3>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2 font-sans">
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li><strong className="text-slate-200">Real-Time API Latency:</strong> TransitView and TrainView position feeds depend on cellular telemetry modem polling on vehicles; location updates may lag by 15-30 seconds.</li>
              <li><strong className="text-slate-200">Underground Tunnel GPS Gaps:</strong> Heavy Rail lines (Market-Frankford Line & Broad Street Line) pass through underground tunnels in Center City where GPS signals are lost, defaulting positions to station arrival events.</li>
              <li><strong className="text-slate-200">Annual Aggregations:</strong> Ridership numbers rely on Automatic Passenger Counters (APC) aggregated annually or seasonally, smoothed across service days.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyPanel;
