# SEPTA Recovery Atlas

An interactive look at how Philadelphia transit changed after 2019 — part recovery tracker, part live operations view, part data sandbox.

**Live demo:** https://septa-covid-analysis.vercel.app  
**Repository:** https://github.com/DMDTague/Septa-Dashboard

> This is an independent project built with public SEPTA data. It is not an official SEPTA product.

## What it does

The dashboard brings a few different views of the system into one place:

- **Recovery overview** — compares bundled post-pandemic ridership figures with a 2019 baseline by mode.
- **Historical trends** — visualizes the project's 2014–2023 bus and rail series.
- **Live vehicle map** — displays buses/trolleys and Regional Rail vehicles from SEPTA's public APIs, with route, mode, delay, and search filters.
- **Live Regional Rail OTP** — calculates a simple on-time percentage from active TrainView records using a five-minute threshold.
- **Active detours** — pulls current bus/trolley detour information from SEPTA's Bus Detours endpoint.
- **Tract scenario explorer** — uses bundled examples to experiment with how uneven or off-peak demand can be visualized geographically.
- **Route-segment sandbox** — lets you change the relative weight of frequency, delay, and load to see how representative segments move in the ranking.
- **CSV export** — makes several dashboard datasets downloadable instead of trapping them inside a chart.

Philadelphia transit data is messy in the interesting way: historical aggregates, live vehicle feeds, geography, service patterns, and very different definitions of what "recovery" means. This project is my attempt to put some of that in the same room.

## Live data vs. built-in analysis

Not every number on the dashboard is fetched live, and the distinction matters.

| Part of the app | Data behavior |
| --- | --- |
| TransitView / vehicle positions | **Live API data** when available |
| TrainView / Regional Rail | **Live API data** when available |
| Bus & trolley detours | **Live API data** when available |
| Mode recovery figures | **Bundled analytical dataset** |
| 2014–2023 ridership series | **Bundled historical dataset** |
| Tract distribution / scenario examples | **Bundled exploratory data** |
| Representative bus segment metrics | **Bundled model inputs** |
| Route polylines shown in the live map | **Bundled representative geometry** |

The live map also contains a small fallback vehicle dataset. If SEPTA's endpoints are unavailable, blocked by CORS, or return no vehicles, the interface can still demonstrate the map instead of collapsing into an empty panel. Fallback records are demonstration data, not live positions.

That makes this a hybrid dashboard: some panels are genuinely live, while others are analytical or illustrative views shipped with the frontend.

## Stack

- **React 19**
- **Vite 7**
- **Recharts** for charts
- **Leaflet + React Leaflet** for mapping
- **Tailwind CSS** for styling
- **Lucide React** for interface icons
- **SEPTA public APIs** for live operational data
- **Vercel** for deployment

There is no application backend or database in this repository. The browser client handles the dashboard and requests SEPTA data directly or through the configured proxy path.

## SEPTA API flow

Live requests use the following order:

1. `/api/septa/...` through the local/Vercel proxy configuration.
2. SEPTA's public API directly.
3. A CORS proxy fallback if the first two approaches fail.

The app currently uses helpers for:

- `TransitView`
- `TransitViewAll`
- `TrainView`
- `BusDetours`
- SEPTA v2 trip data

The live vehicle view refreshes on a 15-second interval.

## Data sources referenced by the project

The dashboard's methodology panel documents the public sources used or referenced by the analysis, including:

- **SEPTA TransitView** — bus and trolley vehicle information
- **SEPTA TrainView** — Regional Rail vehicle and lateness information
- **SEPTA ArcGIS Open Data** — geospatial/open-data material
- **OpenDataPhilly SEPTA datasets** — historical ridership material

Historical and exploratory values currently used by the React app are committed with the frontend rather than re-downloaded from those sources on every page load.

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
src/
├── components/       dashboard panels, maps, exports, methodology
├── utils/            SEPTA API helpers and data transforms
├── SeptaDashboard.jsx
└── main.jsx
```

## A few limitations

- Public transit APIs can be unavailable, rate-limited, delayed, or blocked by browser CORS behavior.
- Several analytical sections are prototypes built from committed datasets rather than continuously updated feeds.
- Representative route geometries and segment scores should not be mistaken for a complete SEPTA network model.
- The route-segment sandbox is an exploratory weighting model, not an operational recommendation system.
- Historical figures should be revalidated against their original public datasets before being used for current planning or policy work.

## Why I built it

I wanted something more interesting than a single "ridership is X% recovered" number. Bus, rail, commuter service, geography, delays, and travel behavior did not all move together after 2020, so the dashboard gives those differences room to show up.

It also gave me an excuse to combine public-data analysis with a live React interface, which is a much better fate for a CSV than quietly dying in a downloads folder.
