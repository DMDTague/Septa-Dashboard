import React from 'react';
import { Activity, ChevronRight, ChevronLeft, Sparkles, HelpCircle } from 'lucide-react';
import { SECTION_INSIGHTS } from '../constants/insights.js';

const InsightPanel = ({ activeSection, hoveredChartData, isCollapsed, onToggle }) => {
  if (isCollapsed) {
    return (
      <div className="w-12 bg-slate-900/90 backdrop-blur-md text-white h-full flex flex-col items-center py-4 border-l border-slate-800 transition-all duration-300 rounded-r-xl shadow-2xl">
        <button onClick={onToggle} className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg mb-4 transition-colors" aria-label="Expand Panel">
          <ChevronLeft size={18} />
        </button>
        <div className="writing-vertical-rl transform rotate-180 text-xs font-semibold tracking-widest uppercase text-slate-400 mt-6 flex items-center gap-2" style={{ writingMode: 'vertical-rl' }}>
          <Activity size={14} className="text-[#EF3E42]" />
          <span>Analysis Context</span>
        </div>
      </div>
    );
  }

  const content = hoveredChartData ? hoveredChartData.content : (SECTION_INSIGHTS[activeSection] || 'Select an element on the dashboard to view analytical insights.');
  const title = hoveredChartData ? hoveredChartData.title : 'Section Overview';
  const isHovered = Boolean(hoveredChartData);

  return (
    <div className="w-80 bg-slate-900/90 backdrop-blur-xl text-white h-full flex flex-col border-l border-slate-800/80 shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-[#005DAA]/30 to-slate-900">
        <div className="flex items-center gap-2.5 font-bold text-base font-heading">
          <div className="p-1.5 rounded-md bg-[#EF3E42]/20 text-[#EF3E42]">
            <Activity size={18} />
          </div>
          <span className="tracking-tight">Analytical Insights</span>
        </div>
        <button onClick={onToggle} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors" aria-label="Collapse Panel">
          <ChevronRight size={18} />
        </button>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {/* Status Indicator Pill */}
        <div className="flex items-center gap-2 text-xs">
          {isHovered ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
              <Sparkles size={12} className="text-blue-400" /> Hover Inspection
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              <HelpCircle size={12} className="text-slate-400" /> Executive Context
            </span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm space-y-3">
          <h3 className="text-base font-bold text-slate-100 font-heading leading-snug">{title}</h3>
          <p className="text-slate-300 leading-relaxed text-xs">
            {content}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#005DAA]/20 to-slate-800/40 border border-[#005DAA]/30 text-xs text-blue-200 space-y-1">
          <p className="font-semibold text-blue-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Interactive Tip
          </p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Hover over chart bars, time-series points, or vehicle map markers to dynamically update this analysis pane.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center font-mono">
        <span className="font-semibold text-[#005DAA] uppercase">{activeSection}</span>
        <span className="text-slate-500">{isHovered ? 'Active Target' : 'System View'}</span>
      </div>
    </div>
  );
};

export default InsightPanel;
