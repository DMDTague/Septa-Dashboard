/**
 * Compute recovery percentages from mode ridership data
 * @param {Array<{mode: string, year: number|string, ridership: number}>} modeData 
 * @param {number|string} baselineYear 
 * @returns {Array} Array of recovery statistics by mode
 */
export function computeRecoveryRates(modeData, baselineYear = 2019) {
  if (!modeData || !Array.isArray(modeData)) return [];
  
  const modes = [...new Set(modeData.map(d => d.mode))];
  
  return modes.map(mode => {
    const modeRecords = modeData.filter(d => d.mode === mode);
    const sorted = [...modeRecords].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    
    const baselineRecord = modeRecords.find(d => parseInt(d.year) === parseInt(baselineYear));
    const latestRecord = sorted[0];
    
    const baselineRidership = baselineRecord ? baselineRecord.ridership : 0;
    const currentRidership = latestRecord ? latestRecord.ridership : 0;
    
    const recovery = baselineRidership > 0 ? (currentRidership / baselineRidership) * 100 : 0;
    const gap = baselineRidership - currentRidership;
    
    let status = 'Unknown';
    if (recovery > 75) status = 'Resilient';
    else if (recovery >= 50) status = 'Mixed';
    else if (recovery > 0) status = 'Structural Decline';
    
    let insight = '';
    if (status === 'Resilient') insight = 'Recovering well relative to baseline.';
    else if (status === 'Mixed') insight = 'Partial recovery; structural challenges remain.';
    else if (status === 'Structural Decline') insight = 'Significant structural decline in ridership.';
    
    return {
      mode,
      recovery: Math.round(recovery * 10) / 10,
      gap,
      status,
      insight,
      baselineRidership,
      currentRidership
    };
  }).filter(r => r.baselineRidership > 0);
}

/**
 * Compute time series from mode data
 * @param {Array<{mode: string, year: number|string, ridership: number}>} modeData
 * @returns {Array<{date: string, [mode]: number}>}
 */
export function computeTimeSeries(modeData) {
  if (!modeData || !Array.isArray(modeData)) return [];
  
  const yearMap = {};
  
  modeData.forEach(({ mode, year, ridership }) => {
    const yearStr = String(year);
    if (!yearMap[yearStr]) {
      yearMap[yearStr] = { date: yearStr };
    }
    yearMap[yearStr][mode] = ridership;
  });
  
  return Object.values(yearMap).sort((a, b) => parseInt(a.date) - parseInt(b.date));
}

/**
 * Compute distribution buckets from census tract data
 * @param {Array} tractData
 * @returns {Array}
 */
export function computeDistributionBuckets(tractData) {
  if (!tractData || !Array.isArray(tractData)) return [];
  
  let coldSpots = 0;
  let standard = 0;
  let high = 0;
  
  tractData.forEach(tract => {
    const val = tract.value || tract.ridership || tract.count || 0;
    if (val < 50) coldSpots++;
    else if (val < 1000) standard++;
    else high++;
  });
  
  return [
    { range: '<50', label: 'Cold Spots', count: coldSpots, desc: 'Low ridership areas' },
    { range: '50-1000', label: 'Standard', count: standard, desc: 'Average ridership areas' },
    { range: '1000+', label: 'High', count: high, desc: 'High ridership areas' }
  ];
}

/**
 * Compute real-time OTP from TrainView data
 * @param {Array} trainViewData
 * @returns {Object}
 */
export function computeOnTimeStats(trainViewData) {
  if (!trainViewData || !Array.isArray(trainViewData)) {
    return { totalTrains: 0, onTimeCount: 0, onTimePct: 0, byLine: [] };
  }
  
  const activeTrains = trainViewData.filter(t => t.late !== 999 && t.late !== '999');
  
  const totalTrains = activeTrains.length;
  let onTimeCount = 0;
  const lineStats = {};
  
  activeTrains.forEach(t => {
    const late = parseInt(t.late) || 0;
    const isOnTime = late <= 5;
    
    if (isOnTime) onTimeCount++;
    
    const line = t.line || 'Unknown';
    if (!lineStats[line]) {
      lineStats[line] = { line, total: 0, onTime: 0 };
    }
    lineStats[line].total++;
    if (isOnTime) lineStats[line].onTime++;
  });
  
  const byLine = Object.values(lineStats).map(l => ({
    ...l,
    pct: l.total > 0 ? Math.round((l.onTime / l.total) * 100) : 0
  })).sort((a, b) => b.total - a.total);
  
  const onTimePct = totalTrains > 0 ? Math.round((onTimeCount / totalTrains) * 100) : 0;
  
  return {
    totalTrains,
    onTimeCount,
    onTimePct,
    byLine
  };
}

/**
 * Compute vehicle summary from TransitView data  
 * @param {Array|Object} transitViewData 
 * @returns {Object}
 */
export function computeVehicleSummary(transitViewData) {
  let vehicles = [];
  
  if (!transitViewData) {
    return { totalVehicles: 0, onTimeCount: 0, lateCount: 0, avgDelay: 0, byRoute: [] };
  }
  
  if (Array.isArray(transitViewData) && transitViewData.length > 0 && transitViewData[0].bus) {
    transitViewData.forEach(route => {
      if (Array.isArray(route.bus)) {
        vehicles = vehicles.concat(route.bus.map(b => ({ ...b, route_id: route.route_id })));
      }
    });
  } else if (Array.isArray(transitViewData)) {
    vehicles = transitViewData;
  } else if (transitViewData.bus && Array.isArray(transitViewData.bus)) {
    vehicles = transitViewData.bus;
  }
  
  if (vehicles.length === 0) {
    return { totalVehicles: 0, onTimeCount: 0, lateCount: 0, avgDelay: 0, byRoute: [] };
  }
  
  const totalVehicles = vehicles.length;
  let onTimeCount = 0;
  let lateCount = 0;
  let totalDelay = 0;
  let validDelayCount = 0;
  
  const routeStats = {};
  
  vehicles.forEach(v => {
    const late = parseInt(v.late) || 0;
    const isOnTime = late <= 2;
    
    if (isOnTime) onTimeCount++;
    else lateCount++;
    
    if (late !== 999 && !isNaN(late)) {
      totalDelay += late;
      validDelayCount++;
    }
    
    const route = v.route_id || 'Unknown';
    if (!routeStats[route]) {
      routeStats[route] = { route, total: 0, onTime: 0, late: 0 };
    }
    routeStats[route].total++;
    if (isOnTime) routeStats[route].onTime++;
    else routeStats[route].late++;
  });
  
  const byRoute = Object.values(routeStats).map(r => ({
    ...r,
    onTimePct: r.total > 0 ? Math.round((r.onTime / r.total) * 100) : 0
  })).sort((a, b) => b.total - a.total);
  
  const avgDelay = validDelayCount > 0 ? Math.round((totalDelay / validDelayCount) * 10) / 10 : 0;
  
  return {
    totalVehicles,
    onTimeCount,
    lateCount,
    avgDelay,
    byRoute
  };
}

/**
 * Classify delay severity
 * @param {number|string} lateMinutes 
 * @returns {string}
 */
export function getDelaySeverity(lateMinutes) {
  if (lateMinutes === null || lateMinutes === undefined || lateMinutes === 999 || lateMinutes === '999') return 'on-time';
  const mins = parseInt(lateMinutes, 10);
  if (isNaN(mins) || mins <= 2) return 'on-time';
  if (mins <= 5) return 'slight';
  if (mins <= 10) return 'moderate';
  return 'severe';
}

/**
 * Get color for delay severity
 * @param {number|string} lateMinutes 
 * @returns {string}
 */
export function getDelayColor(lateMinutes) {
  const severity = getDelaySeverity(lateMinutes);
  switch (severity) {
    case 'slight': return '#f59e0b';
    case 'moderate': return '#ef4444';
    case 'severe': return '#991b1b';
    case 'on-time':
    default:
      return '#10b981';
  }
}
