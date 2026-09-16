import React from 'react';
import { ExternalLink, Database, Map as MapIcon, FileJson, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

const MethodologyPanel = () => {
  const sources = [
    {
      name: "SEPTA TransitView API",
      provides: "Live bus and trolley vehicle information used by the vehicle map when the feed is available",
      format: "REST JSON API",
      refresh: "Polled every 15 sec",
      icon: FileJson,
      url: "https://www3.septa.org/api/TransitViewAll/index.php"
    },
    {
      name: "SEPTA TrainView API",
      provides: "Live Regional Rail train locations and reported lateness used by the map and OTP display",
      format: "REST JSON API",
      refresh: "Polled every 15 sec",
      icon: FileJson,
      url: "https://www3.septa.org/api/TrainView/index.php"
    },
    {
      name: "SEPTA ArcGIS Open Data",
      provides: "Public geospatial and system data referenced for the project's mapping and analytical context",
      format: "GeoJSON / FeatureServer",
      refresh: "Dataset-dependent",
      icon: MapIcon,
      url: "https://data-septa.opendata.arcgis.com/"
    },
    {
      name: "OpenDataPhilly",
      provides: "Public SEPTA datasets referenced for historical ridership and transportation context",
      format: "Open data",
      refresh: "Dataset-dependent",
      icon: Database,
      url: "https://opendataphilly.org/organization/septa/"
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
            <h2 className="text-2xl font-bold font-heading">Data & Methodology</h2>
            <p className="text-blue-200 text-xs font-mono">Public sources, definitions, and what is actually live</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Section 1: Primary Data Sources */}
        <div>
          <h3 className="text-base font-bold text-slate-100 font-heading mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database size={18} className="text-[#005DAA]" />
            Data Sources
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
            Definitions Used in the Dashboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-blue-400 uppercase text-[11px]">Mode Recovery Rate</h4>
              <p className="text-slate-300 text-[11px]">
                <code>(Avg Daily Ridership / 2019 Baseline) × 100</code>
              </p>
              <p className="text-[10px] text-slate-500 font-sans">Used to compare the bundled post-pandemic mode figures with the project's 2019 baseline.</p>
            </div>
            
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 uppercase text-[11px]">On-Time Threshold</h4>
              <p className="text-slate-300 text-[11px]">
                <code>Reported lateness ≤ 5 minutes</code>
              </p>
              <p className="text-[10px] text-slate-500 font-sans">The live Regional Rail display treats TrainView records reported five minutes late or less as on-time.</p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 uppercase text-[11px]">Tract Buckets</h4>
              <p className="text-slate-300 text-[11px]">
                Cold (&lt;50), Standard (50–1k), High (1k+)
              </p>
              <p className="text-[10px] text-slate-500 font-sans">Project-defined buckets used for the exploratory tract view; they are not SEPTA service classifications.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Limitations & Disclaimers */}
        <div>
          <h3 className="text-base font-bold text-slate-100 font-heading mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <ShieldAlert size={18} className="text-[#EF3E42]" />
            What to Keep in Mind
          </h3>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2 font-sans">
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li><strong className="text-slate-200">Live vs. bundled:</strong> TransitView, TrainView, and detour panels request live API data. Recovery, historical, tract, route-geometry, and priority-model values are bundled with the frontend.</li>
              <li><strong className="text-slate-200">Fallback map data:</strong> If the live vehicle APIs are empty or unavailable, the map can display a small demonstration vehicle set so the interface remains usable. Those fallback positions are not live vehicles.</li>
              <li><strong className="text-slate-200">API timing:</strong> A "live" public feed can still lag the physical system because the dashboard only knows the most recent record returned by SEPTA's endpoint.</li>
              <li><strong className="text-slate-200">Exploratory models:</strong> Tract buckets, representative segment scores, and adjustable priority weights are analytical demonstrations, not official SEPTA classifications or planning recommendations.</li>
              <li><strong className="text-slate-200">Historical values:</strong> Bundled figures do not update automatically and should be checked against their source datasets before being used as current planning data.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyPanel;
