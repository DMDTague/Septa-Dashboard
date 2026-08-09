/**
 * SEPTA API Module with Proxy and CORS Fallback
 */

// Prefer relative proxy endpoint (works with Vite dev proxy and Vercel rewrites)
const PROXY_BASE = '/api/septa';
const DIRECT_BASE = 'https://www3.septa.org/api';

async function safeFetch(endpointPath) {
  // 1. Try proxy first
  try {
    const res = await fetch(`${PROXY_BASE}${endpointPath}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Proxy fetch failed, attempt fallback
  }

  // 2. Try direct URL
  try {
    const res = await fetch(`${DIRECT_BASE}${endpointPath}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Direct fetch failed (CORS or network error), try corsproxy fallback
  }

  // 3. Try CORS proxy fallback
  const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(`${DIRECT_BASE}${endpointPath}`)}`;
  const res = await fetch(corsProxyUrl);
  if (!res.ok) {
    throw new Error(`SEPTA API error: ${res.status}`);
  }
  return await res.json();
}

/**
 * Fetch real-time locations of buses/trolleys for a specific route.
 * @param {string|number} route - The route ID (e.g., '10', '47')
 */
export async function fetchTransitView(route) {
  try {
    const data = await safeFetch(`/TransitView/index.php?route=${route}`);
    return { data: data.bus || [], error: null, loading: false };
  } catch (error) {
    return { data: null, error, loading: false };
  }
}

/**
 * Fetch all real-time locations for buses/trolleys across all routes.
 */
export async function fetchTransitViewAll() {
  try {
    const data = await safeFetch('/TransitViewAll/index.php');
    return { data: data.routes || [], error: null, loading: false };
  } catch (error) {
    return { data: null, error, loading: false };
  }
}

/**
 * Fetch all Regional Rail trains.
 */
export async function fetchTrainView() {
  try {
    const data = await safeFetch('/TrainView/index.php');
    return { data: data || [], error: null, loading: false };
  } catch (error) {
    return { data: null, error, loading: false };
  }
}

/**
 * Fetch active bus detours.
 * @param {string|number|null} [route=null]
 */
export async function fetchBusDetours(route = null) {
  try {
    const path = route ? `/BusDetours/${route}` : '/BusDetours/';
    const data = await safeFetch(path);
    return { data: data || [], error: null, loading: false };
  } catch (error) {
    return { data: null, error, loading: false };
  }
}

/**
 * Fetch trips for Subway/Trolley Metro routes.
 * @param {string} routeId
 */
export async function fetchMetroTrips(routeId) {
  try {
    const data = await safeFetch(`/v2/trips/?route_id=${routeId}`);
    return { data: data || [], error: null, loading: false };
  } catch (error) {
    return { data: null, error, loading: false };
  }
}
