import { useState, useEffect } from "react";
import { MapContainer, SVGOverlay, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const tileLayer = {
  url: "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png",
  attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
  maxZoom: 20,
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
    <MapContainer
      className="map"
      center={[routeMeta.center.lat, routeMeta.center.lon]}
      zoom={zoom}
    >
      <TileLayer {...tileLayer} />
      <SVGOverlay
        attributes={{
          viewBox: svgData.viewBox,
          preserveAspectRatio: "xMidYMid meet",
          class: "overlay",
        }}
        bounds={bounds}
      >
        <g dangerouslySetInnerHTML={{ __html: svgData.content }} />
      </SVGOverlay>
    </MapContainer>
  );
};

export default App;
