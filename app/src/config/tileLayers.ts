export type TileLayerDescriptor = {
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
};

export const tileLayers: Record<string, TileLayerDescriptor> = {
  openTopo: {
    label: "OpenTopoMap",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  thunderforestOutdoors: {
    label: "Thunderforest Outdoors",
    url: `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}@2x.png?apikey=${process.env.THUNDERFOREST_API_KEY}`,
    attribution: '&copy; <a href="https://thunderforest.com">Thunderforest</a>',
    maxZoom: 22,
  },
  thunderforestLandscape: {
    label: "Thunderforest Landscape",
    url: `https://tile.thunderforest.com/landscape/{z}/{x}/{y}@2x.png?apikey=${process.env.THUNDERFOREST_API_KEY}`,
    attribution: '&copy; <a href="https://thunderforest.com">Thunderforest</a>',
    maxZoom: 22,
  },
  cycleMap: {
    label: "OpenCycleMap",
    url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
  },
  hikingTrails: {
    label: "Waymarked Trails Hiking",
    url: "https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://hiking.waymarkedtrails.org">Waymarked Trails</a>',
    maxZoom: 18,
  },
  tracesTrack: {
    label: "TracesTrack",
    url: `https://tile.tracestrack.com/topo__/{z}/{x}/{y}.png?key=${process.env.TRACESTRACK_API_KEY}`,
    attribution:
      '© <a href="https://tracestrack.com">TracesTrack</a> contributors, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  },
  stadiaMaps: {
    label: "Stadia Outdoors",
    url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 20,
  },
  osmStandard: {
    label: "OpenStreetMap Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  esriWorldImagery: {
    label: "Esri World Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 19,
  },
  stamenToner: {
    label: "Stamen Toner",
    url: "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
    attribution:
      "Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap",
    maxZoom: 20,
  },
  stamenWatercolor: {
    label: "Stamen Watercolor",
    url: "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
    attribution:
      "Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap",
    maxZoom: 16,
  },
  cartoPositron: {
    label: "CartoDB Positron",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  cartoDarkMatter: {
    label: "CartoDB Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
};
