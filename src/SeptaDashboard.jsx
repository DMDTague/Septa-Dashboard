import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Train,
  Bus,
  MapPin,
  Activity,
  ExternalLink,
  Radio,
  AlertTriangle,
  CheckCircle,
  Menu,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Components
import InsightPanel from './components/InsightPanel';
import DataExportButton from './components/DataExportButton';
import LiveVehicleMap from './components/LiveVehicleMap';
import OnTimePerformance from './components/OnTimePerformance';
import MethodologyPanel from './components/MethodologyPanel';

// Utils
import {
  fetchTrainView,
  fetchBusDetours,
} from './utils/septaApi';

// ---------- BRAND COLORS ----------
const SEPTA_BLUE = '#005DAA';
const SEPTA_RED = '#EF3E42';

// ---------- DATA CONSTANTS ----------
const FALLBACK_MODE_RECOVERY = [
  { mode: 'Bus', recovery: 74.1, gap: -25.9, status: 'Highest in Dataset',
    insight: 'The bundled project dataset places bus ridership at about 74% of its 2019 baseline, the highest recovery figure among the modes shown here.' },
  { mode: 'Heavy Rail', recovery: 50.9, gap: -49.1, status: 'Lower Recovery',
    insight: 'The bundled project dataset places Heavy Rail at about 51% of its 2019 baseline.' },
  { mode: 'Regional Rail', recovery: 54.6, gap: -45.4, status: 'Lower Recovery',
    insight: 'The bundled project dataset places Regional Rail at about 55% of its 2019 baseline.' },
  { mode: 'Trolley', recovery: 56.4, gap: -43.6, status: 'Midrange Recovery',
    insight: 'The bundled project dataset places trolley ridership at about 56% of its 2019 baseline.' },
];

const FALLBACK_TIME_SERIES = [
  { date: '2014', Bus: 414500, Rail: 395200, Total: 809700 },
  { date: '2015', Bus: 421300, Rail: 402800, Total: 824100 },
  { date: '2016', Bus: 428700, Rail: 410500, Total: 839200 },
  { date: '2017', Bus: 435200, Rail: 415300, Total: 850500 },
  { date: '2018', Bus: 448900, Rail: 421600, Total: 870500 },
  { date: '2019', Bus: 457782, Rail: 424975, Total: 882757 },
  { date: '2020', Bus: 259232, Rail: 165482, Total: 424714 },
  { date: '2021', Bus: 238125, Rail: 152148, Total: 390273 },
  { date: '2022', Bus: 298307, Rail: 192274, Total: 490581 },
  { date: '2023', Bus: 338974, Rail: 220750, Total: 559724 },
];

const DISTRIBUTION_DATA = [
  { range: 'Cold Spots', label: 'Cold Spots (<50 trips)', count: 19,
    desc: 'Bundled exploratory category for tracts with fewer than 50 daily boardings and alightings in the project dataset.' },
  { range: 'Standard', label: 'Standard (50–1,000)', count: 190,
    desc: 'Bundled exploratory category for tracts with moderate ridership in the project dataset.' },
  { range: 'High Volume', label: 'High Volume (1,000+)', count: 643,
    desc: 'Bundled exploratory category for tracts with more than 1,000 daily trips in the project dataset.' },
];

const SYSTEM_SNAPSHOT = [
  { id: 'service', label: 'Weekday Scheduled Trips', metric: '7,820', unit: 'trips / weekday',
    chip: 'Bundled Estimate', change: '~92% of 2019', changeTone: 'positive', section: 'overview',
    source: 'Bundled project data',
    hover: { title: 'Scheduled Service Example',
      content: 'This bundled project value is shown relative to a 2019 reference point. It is not refreshed from GTFS on page load.' } },
  { id: 'ridership', label: 'Average Daily Boardings', metric: '~640k', unit: 'riders / weekday',
    chip: 'Bundled Estimate', change: '~63% of 2019', changeTone: 'neutral', section: 'trends',
    source: 'Bundled project data',
    hover: { title: 'Ridership Recovery Example',
      content: 'This bundled project value represents an analytical snapshot relative to 2019 rather than a live ridership feed.' } },
  { id: 'otp', label: 'Regional Rail OTP', metric: '—', unit: 'loading…',
    chip: 'Live OTP', change: 'Real-time', changeTone: 'neutral', section: 'liveMap',
    source: 'TrainView API (live)',
    hover: { title: 'Live On-Time Performance',
      content: 'On-time percentage computed from active TrainView records returned by SEPTA. Records reported five minutes late or less count as on-time in this dashboard.' } },
  { id: 'detours', label: 'Active Route Detours', metric: '—', unit: 'loading…',
    chip: 'Live Feed', change: 'Real-time', changeTone: 'neutral', section: 'liveMap',
    source: 'Bus Detours API (live)',
    hover: { title: 'Active Detour Advisories',
      content: 'Current count of bus and trolley detour records returned by SEPTA\'s Bus Detours API.' } },
];

const LATENT_DEMAND_TARGETS = [
  { id: 1, tract: '42101010106', name: 'North Philadelphia - Temple', baseline: 12, peak: 108,
    spike: '9.0x', priority: 'High', lat: 39.98, lng: -75.16,
    description: 'Illustrative scenario used to explore how a large off-peak spike would appear in the interface.',
    action: 'Example experiment: late-night micro-transit pilot.' },
  { id: 2, tract: '42101010', name: 'Germantown', baseline: 15, peak: 98,
    spike: '6.5x', priority: 'High', lat: 40.0428, lng: -75.17,
    description: 'Illustrative scenario used to explore a neighborhood connector concept.',
    action: 'Example experiment: connector shuttle to Wayne Junction.' },
  { id: 3, tract: '42101104503', name: 'West Philadelphia', baseline: 18, peak: 95,
    spike: '5.3x', priority: 'High', lat: 39.96, lng: -75.22,
    description: 'Illustrative scenario used to explore first-mile and last-mile demand.',
    action: 'Example experiment: feeder service to the Market-Frankford Line.' },
  { id: 4, tract: '42101203207', name: 'Northeast Philadelphia', baseline: 14, peak: 89,
    spike: '6.4x', priority: 'High', lat: 40.04, lng: -75.05,
    description: 'Illustrative scenario used to explore an on-demand service model.',
    action: 'Example experiment: on-demand micro-transit zone.' },
  { id: 5, tract: '42101308402', name: 'South Philadelphia', baseline: 16, peak: 87,
    spike: '5.4x', priority: 'Medium', lat: 39.92, lng: -75.16,
    description: 'Illustrative scenario used to explore a small-vehicle circulator concept.',
    action: 'Example experiment: neighborhood circulator shuttle.' },
];

const BUS_SEGMENTS = [
  { id: '23_north_1', line: 'Route 23', direction: 'Northbound', from: 'South Philadelphia',
    to: 'Center City', freq_per_hr: 18, avg_delay_min: 4, load_factor: 0.85,
    coords: [[39.92, -75.16], [39.94, -75.16], [39.96, -75.16]] },
  { id: '23_south_1', line: 'Route 23', direction: 'Southbound', from: 'Center City',
    to: 'South Philadelphia', freq_per_hr: 18, avg_delay_min: 6, load_factor: 0.9,
    coords: [[39.96, -75.158], [39.94, -75.158], [39.92, -75.158]] },
  { id: '47_north_1', line: 'Route 47', direction: 'Northbound', from: 'South Philadelphia',
    to: 'North Philadelphia', freq_per_hr: 14, avg_delay_min: 5, load_factor: 0.8,
    coords: [[39.92, -75.15], [39.95, -75.15], [39.98, -75.15]] },
  { id: '47_south_1', line: 'Route 47', direction: 'Southbound', from: 'North Philadelphia',
    to: 'South Philadelphia', freq_per_hr: 14, avg_delay_min: 3, load_factor: 0.7,
    coords: [[39.98, -75.148], [39.95, -75.148], [39.92, -75.148]] },
  { id: '52_east_1', line: 'Route 52', direction: 'Eastbound', from: 'West Philadelphia',
    to: 'Center City', freq_per_hr: 10, avg_delay_min: 7, load_factor: 0.92,
    coords: [[39.96, -75.23], [39.96, -75.21], [39.96, -75.19], [39.96, -75.17]] },
  { id: '52_west_1', line: 'Route 52', direction: 'Westbound', from: 'Center City',
    to: 'West Philadelphia', freq_per_hr: 10, avg_delay_min: 5, load_factor: 0.75,
    coords: [[39.958, -75.17], [39.958, -75.19], [39.958, -75.21], [39.958, -75.23]] },
];

function getColorForScore(score) {
  const clamped = Math.max(0, Math.min(1, score || 0));
  const r = Math.round(0 + 239 * clamped);
  const g = Math.round(93 + (62 - 93) * clamped);
  const b = Math.round(170 + (66 - 170) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

function computeSegmentScore(segment, weights) {
  const freqScore = segment.freq_per_hr / 20;
  const delayScore = 1 - Math.min(segment.avg_delay_min / 10, 1);
  const loadScore = segment.load_factor;
  const totalWeight = (weights.freq || 0) + (weights.delay || 0) + (weights.load || 0) || 1;
  return ((weights.freq || 0) * freqScore + (weights.delay || 0) * delayScore + (weights.load || 0) * loadScore) / totalWeight;
}

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'trends', label: 'Trends', icon: TrendingUp },
  { key: 'liveMap', label: 'Live Map', icon: Radio },
  { key: 'equity', label: 'Tracts', icon: MapPin },
  { key: 'network', label: 'Network', icon: Bus },
  { key: 'priority', label: 'Sandbox', icon: AlertTriangle },
  { key: 'methodology', label: 'About Data', icon: ExternalLink },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md p-4 border border-slate-700 rounded-xl shadow-2xl text-slate-100 text-xs">
        <p className="font-bold text-slate-200 mb-2 font-heading text-sm">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400 capitalize">{entry.name}:</span>
            <span className="font-mono font-bold text-white">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SeptaDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [hoveredChartData, setHoveredChartData] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(LATENT_DEMAND_TARGETS[0]);
  const [insightCollapsed, setInsightCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [priorityWeights, setPriorityWeights] = useState({ freq: 40, delay: 30, load: 30 });
  const [activeNetworkMetric, setActiveNetworkMetric] = useState('freq');

  const [trainData, setTrainData] = useState([]);
  const [detourCount, setDetourCount] = useState(null);
  const [liveOtp, setLiveOtp] = useState(null);

  const [modeRecoveryData] = useState(FALLBACK_MODE_RECOVERY);
  const [timeSeriesData] = useState(FALLBACK_TIME_SERIES);

  const changeSection = useCallback((sectionKey) => {
    setActiveSection(sectionKey);
    setHoveredChartData(null);
    setMobileMenuOpen(false);
  }, []);

  const scoredSegments = useMemo(() =>
    BUS_SEGMENTS.map(seg => ({ ...seg, score: computeSegmentScore(seg, priorityWeights) }))
      .sort((a, b) => b.score - a.score),
    [priorityWeights]
  );

  useEffect(() => {
    async function fetchLiveData() {
      try {
        const [trainResult, detourResult] = await Promise.allSettled([
          fetchTrainView(),
          fetchBusDetours(),
        ]);

        if (trainResult.status === 'fulfilled' && trainResult.value.data) {
          const trains = trainResult.value.data;
          setTrainData(trains);
          const activeTrains = trains.filter(t => t.late !== 999);
          const onTime = activeTrains.filter(t => t.late <= 5).length;
          const pct = activeTrains.length > 0 ? Math.round((onTime / activeTrains.length) * 100) : 0;
          setLiveOtp({ pct, total: activeTrains.length, onTime });
        }

        if (detourResult.status === 'fulfilled' && detourResult.value.data) {
          const detours = detourResult.value.data;
          setDetourCount(Array.isArray(detours) ? detours.length : 0);
        }
      } catch (e) {
        console.error('Failed to fetch live data:', e);
      }
    }

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const dynamicSnapshot = useMemo(() => {
    return SYSTEM_SNAPSHOT.map(card => {
      if (card.id === 'otp' && liveOtp) {
        return { ...card, metric: `${liveOtp.pct}%`, unit: `${liveOtp.onTime}/${liveOtp.total} trains on time`,
          change: liveOtp.pct >= 90 ? 'Good' : liveOtp.pct >= 75 ? 'Fair' : 'Poor',
          changeTone: liveOtp.pct >= 90 ? 'positive' : liveOtp.pct >= 75 ? 'neutral' : 'negative' };
      }
      if (card.id === 'detours' && detourCount !== null) {
        return { ...card, metric: `${detourCount}`, unit: 'active detours',
          change: detourCount === 0 ? 'All clear' : `${detourCount} route${detourCount !== 1 ? 's' : ''} affected`,
          changeTone: detourCount === 0 ? 'positive' : detourCount <= 5 ? 'neutral' : 'negative' };
      }
      return card;
    });
  }, [liveOtp, detourCount]);

  const handleHoverInsight = useCallback((data) => setHoveredChartData(data), []);

  const changeColorClass = (tone) => {
    if (tone === 'positive') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (tone === 'negative') return 'text-red-400 bg-red-500/10 border-red-500/30';
    return 'text-slate-300 bg-slate-800 border-slate-700';
  };

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 pb-16">
      {/* ===== HEADER BAR ===== */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#005DAA] to-[#003e73] text-white shadow-lg shadow-blue-900/40 border border-blue-400/20">
                <Train size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-white tracking-tight font-heading">
                    SEPTA Recovery Atlas
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EF3E42]/20 text-[#EF3E42] border border-[#EF3E42]/30 font-semibold uppercase tracking-wider">
                    Independent Project
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live SEPTA APIs + bundled historical analysis (2014–2023)
                </p>
              </div>
            </div>

            {/* Desktop Nav Pills */}
            <nav className="hidden lg:flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800">
              {SECTIONS.map((sec) => {
                const IconComponent = sec.icon;
                const isActive = activeSection === sec.key;
                return (
                  <button
                    key={sec.key}
                    onClick={() => changeSection(sec.key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#005DAA] text-white shadow-md shadow-blue-900/50 border border-blue-400/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <IconComponent size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                    {sec.label}
                  </button>
                );
              })}
            </nav>

            {/* Mobile menu trigger */}
            <button
              className="lg:hidden p-2 rounded-lg border border-slate-800 bg-slate-800/80 text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-3 p-2 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="grid grid-cols-2 gap-1.5">
                {SECTIONS.map((sec) => {
                  const IconComponent = sec.icon;
                  const isActive = activeSection === sec.key;
                  return (
                    <button
                      key={sec.key}
                      onClick={() => changeSection(sec.key)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left flex items-center gap-2 ${
                        isActive ? 'bg-[#005DAA] text-white font-bold' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComponent size={14} />
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* ===== MAIN DASHBOARD CONTAINER ===== */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* SYSTEM SNAPSHOT KPI RIBBON */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[#005DAA]" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                System Snapshot
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Live + bundled data</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {dynamicSnapshot.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => { setActiveSection(card.section); if (card.hover) setHoveredChartData(card.hover); }}
                onMouseEnter={() => { if (card.hover) setHoveredChartData(card.hover); }}
                onMouseLeave={() => setHoveredChartData(null)}
                className="group text-left p-4 rounded-xl glass-panel glass-card-hover flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {card.chip}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${changeColorClass(card.changeTone)}`}>
                    {card.change}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-medium">{card.label}</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black text-white font-mono tracking-tight">{card.metric}</span>
                    <span className="text-[11px] text-slate-400">{card.unit}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/60 flex items-center justify-between font-mono">
                  <span>Source: {card.source}</span>
                  <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Explore →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ===== MAIN CONTENT GRID WITH INSIGHT SIDEBAR ===== */}
        <div className={`grid gap-6 ${insightCollapsed ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[1fr_320px]'}`}>
          {/* MAIN VISUALIZATION COLUMN */}
          <div className="space-y-6 min-w-0">

            {/* OVERVIEW TAB */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Highlights Banner Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    className="p-5 rounded-xl glass-panel glass-card-hover border-l-4 border-l-[#005DAA] cursor-pointer space-y-2"
                    onMouseEnter={() => setHoveredChartData({
                      title: 'Bus Recovery in the Bundled Dataset',
                      content: `Bus ridership is shown at ${modeRecoveryData[0]?.recovery?.toFixed(1)}% of the 2019 baseline in the dataset bundled with this project.`
                    })}
                    onMouseLeave={() => setHoveredChartData(null)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-lg bg-[#005DAA]/20 text-[#005DAA]">
                        <Bus size={20} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                        Highest Recovery
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Surface Bus Network</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-white font-mono">{modeRecoveryData[0]?.recovery?.toFixed(0)}%</p>
                      <span className="text-xs text-emerald-400 font-mono">of baseline</span>
                    </div>
                    <p className="text-[11px] text-slate-400">2019 reference · bundled project dataset</p>
                  </div>

                  <div
                    className="p-5 rounded-xl glass-panel glass-card-hover border-l-4 border-l-[#EF3E42] cursor-pointer space-y-2"
                    onMouseEnter={() => setHoveredChartData({
                      title: 'Rail Recovery in the Bundled Dataset',
                      content: 'Heavy Rail and Regional Rail are shown at roughly 51% and 55% of their 2019 baselines in the dataset bundled with this project.'
                    })}
                    onMouseLeave={() => setHoveredChartData(null)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-lg bg-[#EF3E42]/20 text-[#EF3E42]">
                        <Train size={20} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                        Lower Recovery
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Combined Rail Modes</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-white font-mono">
                        ~{Math.round((modeRecoveryData.filter(m => m.mode.includes('Rail')).reduce((s, m) => s + m.recovery, 0)) / modeRecoveryData.filter(m => m.mode.includes('Rail')).length)}%
                      </p>
                      <span className="text-xs text-red-400 font-mono">of baseline</span>
                    </div>
                    <p className="text-[11px] text-slate-400">2019 reference · bundled project dataset</p>
                  </div>
                </div>

                {/* Mode Recovery Bar Chart */}
                <div className="p-6 rounded-xl glass-panel space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-4 pb-3 border-b border-slate-800">
                    <div>
                      <h2 className="text-lg font-bold text-white font-heading">System-Wide Mode Recovery Index</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Bundled post-pandemic ridership figures relative to a 2019 baseline</p>
                    </div>
                    <DataExportButton data={modeRecoveryData} filename="septa_mode_recovery_stats" label="Export Dataset" />
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={modeRecoveryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#1e293b" />
                        <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }}
                          label={{ value: 'Recovery % of 2019 Baseline', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748b' }} />
                        <YAxis dataKey="mode" type="category" width={110} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                        <ReferenceLine x={100} stroke="#64748b" strokeDasharray="3 3"
                          label={{ value: '2019 Baseline (100%)', position: 'top', fill: '#94a3b8', fontSize: 10 }} />
                        <Bar dataKey="recovery" radius={[0, 6, 6, 0]} barSize={32}>
                          {modeRecoveryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.recovery >= 70 ? '#005DAA' : entry.recovery >= 55 ? '#f59e0b' : '#EF3E42'}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onMouseEnter={() => setHoveredChartData({ title: `${entry.mode}: ${entry.status}`, content: entry.insight })}
                              onMouseLeave={() => setHoveredChartData(null)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex justify-between items-center font-mono">
                    <span>Reference: 2019 baseline = 100%</span>
                    <span>Data: bundled project dataset</span>
                  </div>
                </div>
              </div>
            )}

            {/* TRENDS TAB */}
            {activeSection === 'trends' && (
              <div className="p-6 rounded-xl glass-panel space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-4 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white font-heading">Historical Demand Trends (2014–2023)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Bundled average-daily-ridership series for bus and rail</p>
                  </div>
                  <DataExportButton data={timeSeriesData} filename="septa_historical_trends_2014_2023" label="Export Time Series" />
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="colorBusGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#005DAA" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#005DAA" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorRailGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF3E42" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#EF3E42" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#64748b" tickFormatter={val => `${Math.round(val / 1000)}k`} tick={{ fontSize: 12 }}
                        label={{ value: 'Avg. Daily Riders', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <ReferenceLine x="2020" stroke="#EF3E42" strokeDasharray="3 3"
                        label={{ value: 'COVID-19', position: 'top', fill: '#f87171', fontSize: 11 }} />
                      <Area type="monotone" dataKey="Bus" stroke="#005DAA" fill="url(#colorBusGrad)" strokeWidth={3}
                        onMouseEnter={() => setHoveredChartData({
                          title: 'Bus Trend',
                          content: 'The bundled series shows a steep decline in 2020 followed by a partial recovery through 2023.'
                        })}
                        onMouseLeave={() => setHoveredChartData(null)} />
                      <Area type="monotone" dataKey="Rail" stroke="#EF3E42" fill="url(#colorRailGrad)" strokeWidth={3}
                        onMouseEnter={() => setHoveredChartData({
                          title: 'Rail Trend',
                          content: 'The bundled rail series shows a steep 2020 decline followed by a partial recovery through 2023.'
                        })}
                        onMouseLeave={() => setHoveredChartData(null)} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* LIVE MAP TAB */}
            {activeSection === 'liveMap' && (
              <div className="space-y-6">
                <LiveVehicleMap onHoverInsight={handleHoverInsight} />
                <OnTimePerformance trainData={trainData} busData={[]} onHoverInsight={handleHoverInsight} />
              </div>
            )}

            {/* TRACT EXPLORATION TAB */}
            {activeSection === 'equity' && (
              <div className="space-y-6">
                <div className="p-6 rounded-xl glass-panel space-y-4">
                  <div className="flex flex-wrap justify-between items-start gap-4 pb-3 border-b border-slate-800">
                    <div>
                      <h2 className="text-lg font-bold text-white font-heading">Exploratory Tract Distribution</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Bundled tract categories used for interface exploration</p>
                    </div>
                    <DataExportButton data={DISTRIBUTION_DATA} filename="septa_census_tract_distribution" label="Export Distribution" />
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={DISTRIBUTION_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#64748b" label={{ value: 'Census Tract Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {DISTRIBUTION_DATA.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.range === 'High Volume' ? '#005DAA' : entry.range === 'Cold Spots' ? '#EF3E42' : '#94a3b8'}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onMouseEnter={() => setHoveredChartData({ title: `${entry.label}`, content: entry.desc })}
                              onMouseLeave={() => setHoveredChartData(null)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Latent Demand Scenario Explorer */}
                <div className="p-6 rounded-xl glass-panel space-y-4 border border-[#005DAA]/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                        <Sparkles size={18} className="text-blue-400" /> Latent Demand Scenario Explorer
                      </h3>
                      <p className="text-xs text-slate-400">Illustrative scenarios for exploring off-peak demand</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="rounded-xl overflow-hidden border border-slate-800 h-96">
                      <MapContainer center={[39.96, -75.16]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom className="z-0">
                        <TileLayer attribution='&copy; CartoDB' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        {LATENT_DEMAND_TARGETS.map((target) => (
                          <CircleMarker key={target.id} center={[target.lat, target.lng]}
                            pathOptions={{ color: '#EF3E42', fillColor: '#EF3E42', fillOpacity: 0.8, weight: 3 }}
                            radius={14}
                            eventHandlers={{ click: () => {
                              setSelectedTarget(target);
                              setHoveredChartData({
                                title: `Scenario: ${target.name}`,
                                content: `${target.spike} example surge above a baseline of ${target.baseline}/day. ${target.action}`
                              });
                            } }}
                          >
                            <Popup>
                              <div className="p-1 space-y-1 text-xs">
                                <p className="font-bold text-white text-sm">{target.name}</p>
                                <p className="text-slate-300">Baseline: {target.baseline}/day</p>
                                <p className="text-slate-300">Peak: {target.peak}/day</p>
                                <p className="text-red-400 font-bold">Multiplier: {target.spike}</p>
                              </div>
                            </Popup>
                          </CircleMarker>
                        ))}
                      </MapContainer>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin size={18} className="text-[#005DAA]" />
                          <h4 className="text-base font-bold text-white font-heading">{selectedTarget.name}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">Baseline</span>
                            <p className="text-lg font-black font-mono text-slate-200">{selectedTarget.baseline} riders/day</p>
                          </div>
                          <div className="p-3 rounded-lg bg-[#005DAA]/20 border border-blue-500/30">
                            <span className="text-[10px] font-mono text-blue-300 uppercase">Example Peak</span>
                            <p className="text-lg font-black font-mono text-blue-200">{selectedTarget.peak} riders/day</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <strong className="text-white">Scenario:</strong> {selectedTarget.description}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#EF3E42]/15 border border-[#EF3E42]/30 text-xs">
                        <p className="font-bold text-red-400 uppercase flex items-center gap-1.5 mb-1">
                          <CheckCircle size={14} /> Example Service Experiment
                        </p>
                        <p className="text-slate-200 font-medium">{selectedTarget.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NETWORK TAB */}
            {activeSection === 'network' && (
              <div className="p-6 rounded-xl glass-panel space-y-5">
                <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white font-heading">Representative Bus Segments</h2>
                    <p className="text-xs text-slate-400">Routes 23, 47, and 52 using bundled example metrics</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Lens:</span>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {[{ key: 'freq', label: 'Frequency' }, { key: 'delay', label: 'Reliability' }, { key: 'load', label: 'Passenger Load' }].map(opt => (
                        <button key={opt.key} onClick={() => setActiveNetworkMetric(opt.key)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            activeNetworkMetric === opt.key ? 'bg-[#005DAA] text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <div className="xl:col-span-2 rounded-xl overflow-hidden border border-slate-800 h-[460px]">
                    <MapContainer center={[39.96, -75.17]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                      <TileLayer attribution='&copy; CartoDB' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      {BUS_SEGMENTS.map(seg => {
                        let baseScore;
                        if (activeNetworkMetric === 'freq') baseScore = seg.freq_per_hr / 20;
                        else if (activeNetworkMetric === 'delay') baseScore = 1 - Math.min(seg.avg_delay_min / 10, 1);
                        else baseScore = seg.load_factor;
                        return (
                          <Polyline key={seg.id} positions={seg.coords}
                            pathOptions={{ color: getColorForScore(baseScore), weight: 6, opacity: 0.95 }}
                            eventHandlers={{
                              mouseover: () => setHoveredChartData({
                                title: `${seg.line} — ${seg.direction}`,
                                content: `${seg.freq_per_hr} buses/hr, ${seg.avg_delay_min}m delay offset, ${(seg.load_factor * 100).toFixed(0)}% load factor in the bundled example data.`
                              }),
                              mouseout: () => setHoveredChartData(null),
                            }}
                          />
                        );
                      })}
                    </MapContainer>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-300 font-mono uppercase mb-2">Score Scale</h4>
                      <div className="h-2.5 w-full rounded-full" style={{ backgroundImage: `linear-gradient(to right, ${SEPTA_BLUE}, ${SEPTA_RED})` }} />
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
                        <span>Lower Score</span>
                        <span>Higher Score</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SANDBOX TAB */}
            {activeSection === 'priority' && (
              <div className="p-6 rounded-xl glass-panel space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white font-heading">Multi-Criteria Route Segment Sandbox</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Adjust weights to see how representative route segments move in the ranking</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-white font-mono uppercase">Criteria Weights</h4>
                      {[
                        { key: 'freq', label: 'Frequency Weight', color: '#005DAA' },
                        { key: 'delay', label: 'Delay Weight', color: '#f59e0b' },
                        { key: 'load', label: 'Load Factor Weight', color: '#EF3E42' },
                      ].map(w => (
                        <div key={w.key} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-300">{w.label}</span>
                            <span className="font-mono text-white">{priorityWeights[w.key]}%</span>
                          </div>
                          <input type="range" min="0" max="100" value={priorityWeights[w.key]}
                            onChange={e => setPriorityWeights(prev => ({ ...prev, [w.key]: Number(e.target.value) }))}
                            className="w-full" />
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <h4 className="text-xs font-bold text-white font-mono uppercase mb-3">Ranked Example Segments</h4>
                      <div className="space-y-2 max-h-56 overflow-auto custom-scrollbar">
                        {scoredSegments.map((seg) => (
                          <div key={seg.id} className="flex items-center justify-between gap-2 text-xs border border-slate-800 rounded-lg p-2 bg-slate-900/60">
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{seg.line} {seg.direction}</p>
                              <p className="text-[10px] text-slate-400">{seg.from} → {seg.to}</p>
                            </div>
                            <span className="font-mono font-bold text-blue-400 text-xs">{Math.round(seg.score * 100)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="xl:col-span-2 rounded-xl overflow-hidden border border-slate-800 h-[440px]">
                    <MapContainer center={[39.96, -75.17]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                      <TileLayer attribution='&copy; CartoDB' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      {scoredSegments.map(seg => (
                        <Polyline key={seg.id} positions={seg.coords}
                          pathOptions={{ color: getColorForScore(seg.score), weight: 7, opacity: 0.95 }}
                        />
                      ))}
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}

            {/* METHODOLOGY TAB */}
            {activeSection === 'methodology' && <MethodologyPanel />}
          </div>

          {/* RIGHT COLUMN: ANALYSIS SIDEBAR */}
          {!insightCollapsed && (
            <div className="hidden lg:block">
              <div className="sticky top-20 h-[calc(100vh-6rem)]">
                <InsightPanel
                  activeSection={activeSection}
                  hoveredChartData={hoveredChartData}
                  isCollapsed={insightCollapsed}
                  onToggle={() => setInsightCollapsed(!insightCollapsed)}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}