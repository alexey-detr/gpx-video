import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, SVGOverlay, TileLayer } from "react-leaflet";
import "./App.css";

const tileLayers = {
  // OpenTopoMap - detailed topographic maps
  openTopo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },

  // Thunderforest Outdoors (requires API key)
  thunderforestOutdoors: {
    url: "https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://thunderforest.com">Thunderforest</a>',
    maxZoom: 22,
  },

  thunderforestLandscape: {
    url: "https://tile.thunderforest.com/landscape/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://thunderforest.com">Thunderforest</a>',
    maxZoom: 22,
  },

  // OpenCycleMap
  cycleMap: {
    url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
  },

  // Hiking-specific tiles from Waymarked Trails
  hikingTrails: {
    url: "https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://hiking.waymarkedtrails.org">Waymarked Trails</a>',
    maxZoom: 18,
  },

  tracesTrack: {
    url: "https://tile.tracestrack.com/topo__/{z}/{x}/{y}.png",
    attribution:
      '© <a href="https://tracestrack.com">TracesTrack</a> contributors, © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  },

  stadiaMaps: {
    url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 20,
  },
};

const zoom = 11;

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

const App = () => {
  const [svgData, setSvgData] = useState<SVGData | null>(null);
  const [routeMeta, setRouteMeta] = useState<RouteMeta | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [strokeDasharray, setStrokeDasharray] = useState<string>("0 0");

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
      } catch (error) {
        console.error("Error loading files:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (routeMeta) {
      const totalDistance = 96;
      const updateDistance = () => {
        const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
        const progress = Math.min(elapsedTime / 60, 1); // 60s duration
        const dashArrayValue = progress * routeMeta.realPathLength;
        setStrokeDasharray(`${dashArrayValue} ${routeMeta.realPathLength}`);
        setDistance(progress * totalDistance);
      };

      const startTime = Date.now();
      const intervalId = setInterval(updateDistance, 1000 / 60);

      return () => clearInterval(intervalId);
    }
  }, [routeMeta]);

  if (!routeMeta || !svgData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const bounds = [
    [routeMeta.minLat, routeMeta.minLon],
    [routeMeta.maxLat, routeMeta.maxLon],
  ] as [[number, number], [number, number]];

  return (
    <>
      <MapContainer
        className="map"
        center={[routeMeta.center.lat, routeMeta.center.lon]}
        zoom={zoom}
      >
        <TileLayer {...tileLayers.tracesTrack} />
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
              stroke: "#e83247",
              strokeWidth: 5,
              filter: "url(#shadow)",
            }}
          />
        </SVGOverlay>
      </MapContainer>
      <div className="distance-counter">{distance.toFixed(1)} km</div>
    </>
  );
};

export default App;
