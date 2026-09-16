export const SECTION_INSIGHTS = {
  overview: 'System-wide summary of the recovery figures included with this project, using 2019 as the pre-pandemic baseline. These values are bundled analytical data rather than a live ridership feed.',
  trends: 'Historical ridership series included with the project, showing the sharp 2020 decline and the recovery pattern through the years represented in the dataset.',
  equity: 'Exploratory tract-level view built from the project\'s bundled examples. It is intended to show how geography and uneven demand can be investigated, not to serve as a complete equity assessment of Philadelphia transit.',
  map: 'Spatial view of transit activity and representative geography used by the dashboard.',
  targets: 'Exploratory comparison of service and performance measures. This dashboard is independent and does not report official progress toward SEPTA planning targets.',
  network: 'Representative network segments used to compare frequency, delay, and load-related measures. The displayed segments are not a complete model of the SEPTA bus network or Bus Revolution plan.',
  priority: 'Interactive weighting sandbox for the representative route segments. Change the frequency, delay, and load weights to see how the ranking responds; the result is exploratory, not an operational recommendation.',
  liveMap: 'Vehicle map using SEPTA TransitView and TrainView data when those public APIs are available. The view refreshes every 15 seconds and can fall back to bundled demonstration vehicles if the live feeds are empty or unavailable.',
  methodology: 'The project combines SEPTA public APIs with bundled historical and exploratory datasets. The methodology section documents the intended sources, definitions, limitations, and which parts of the dashboard are live versus static.'
};
