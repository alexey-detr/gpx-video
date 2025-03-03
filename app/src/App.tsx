import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, SVGOverlay, TileLayer } from "react-leaflet";
import "./App.css";

// Updated type to include a human readable label
type TileLayerDescriptor = {
  label: string;
  url: string;
  attribution: string;
  maxZoom: number;
};

const tileLayers: Record<string, TileLayerDescriptor> = {
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

const zoom = 8;

type RouteMeta = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  center: {
    lat: number;
    lon: number;
  };
  totalDistance: number;
  realPathLength: number;
};

type SVGData = {
  content: string;
  viewBox: string;
};

const extractSVGData = (svgText: string): SVGData => {
  const viewBoxMatch = svgText.match(/viewBox=["']([^"']+)["']/);
  const contentMatch = svgText.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);

  return {
    viewBox: viewBoxMatch?.[1] || "0 0 100 100",
    content: contentMatch?.[1] || "",
  };
};

const getSavedToolbarSettings = () => {
  try {
    const saved = localStorage.getItem("toolbarSettings");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error reading toolbarSettings from localStorage", error);
  }
  return {};
};

const App = () => {
  const savedSettings = getSavedToolbarSettings();

  const [tileLayerKey, setTileLayerKey] = useState<string>(
    savedSettings.tileLayerKey && tileLayers[savedSettings.tileLayerKey]
      ? savedSettings.tileLayerKey
      : "tracesTrack"
  );
  const [duration, setDuration] = useState<number>(
    savedSettings.duration ?? 60
  );
  const [strokeWidth, setStrokeWidth] = useState<number>(
    savedSettings.strokeWidth ?? 5
  );
  const [showDistance, setShowDistance] = useState<boolean>(
    typeof savedSettings.showDistance === "boolean"
      ? savedSettings.showDistance
      : true
  );
  const [svgData, setSvgData] = useState<SVGData | null>(null);
  const [routeMeta, setRouteMeta] = useState<RouteMeta | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [strokeDasharray, setStrokeDasharray] = useState<string>("0 0");
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setStarted(true), 2000);
  }, []);

  useEffect(() => {
    const settings = { tileLayerKey, duration, strokeWidth, showDistance };
    localStorage.setItem("toolbarSettings", JSON.stringify(settings));
  }, [tileLayerKey, duration, strokeWidth, showDistance]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [svgResponse, metaResponse] = await Promise.all([
          fetch("/route.svg"),
          fetch("/route.meta.json"),
        ]);

        const svgText = await svgResponse.text();
        setSvgData(extractSVGData(svgText));

        const meta = await metaResponse.json();
        setRouteMeta(meta);
        setStrokeDasharray(`0 ${meta.realPathLength}`);
      } catch (error) {
        console.error("Error loading files:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!routeMeta || !started) {
      return;
    }

    const updateDistance = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsedTime / duration, 1);
      const dashArrayValue = progress * routeMeta.realPathLength;
      setStrokeDasharray(`${dashArrayValue} ${routeMeta.realPathLength}`);
      setDistance(progress * routeMeta.totalDistance);
    };

    const startTime = Date.now();
    const intervalId = setInterval(updateDistance, 1000 / 60);

    return () => clearInterval(intervalId);
  }, [routeMeta, started, duration]);

  if (!routeMeta || !svgData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const currentTileLayer = tileLayers[tileLayerKey];
  const bounds = [
    [routeMeta.minLat, routeMeta.minLon],
    [routeMeta.maxLat, routeMeta.maxLon],
  ] as [[number, number], [number, number]];

  return (
    <>
      <div className="top-bar-container">
        <div className="top-bar">
          <label>
            Tile Layer:
            <select
              value={tileLayerKey}
              onChange={(e) => setTileLayerKey(e.target.value)}
            >
              {Object.entries(tileLayers).map(([key, provider]) => (
                <option key={key} value={key}>
                  {provider.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Duration:
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </label>
          <label>
            Stroke Width:
            <input
              type="number"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={showDistance}
              onChange={(e) => setShowDistance(e.target.checked)}
            />
            Show Distance
          </label>
        </div>
      </div>
      <MapContainer
        className="map"
        center={[routeMeta.center.lat, routeMeta.center.lon]}
        zoom={zoom}
      >
        <TileLayer
          url={currentTileLayer.url}
          attribution={currentTileLayer.attribution}
          maxZoom={currentTileLayer.maxZoom}
        />
        <SVGOverlay
          attributes={{
            viewBox: svgData.viewBox,
            preserveAspectRatio: "xMidYMid meet",
            class: "overlay",
          }}
          bounds={bounds}
        >
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="1"
                dy="1"
                stdDeviation="1"
                flood-color="#000000"
                flood-opacity="0.8"
              />
            </filter>
          </defs>
          <g
            dangerouslySetInnerHTML={{ __html: svgData.content }}
            style={{
              strokeDasharray,
              stroke: "#dc1b1b",
              strokeWidth,
              filter: "url(#shadow)",
            }}
          />
        </SVGOverlay>
      </MapContainer>
      {showDistance && (
        <div className="distance-counter">{distance.toFixed(1)} km</div>
      )}
    </>
  );
};

export default App;
