import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, SVGOverlay, TileLayer } from "react-leaflet";
import "./App.css";
import Toolbar from "./components/Toolbar";
import { tileLayers } from "./config/tileLayers";
import { useRouteData } from "./hooks/useRouteData";
import { useToolbarSettings } from "./hooks/useToolbarSettings";

const zoom = 8;

const App = () => {
  const {
    tileLayerKey,
    setTileLayerKey,
    duration,
    setDuration,
    strokeWidth,
    setStrokeWidth,
    showDistance,
    setShowDistance,
  } = useToolbarSettings();

  const { svgData, routeMeta, strokeDasharray, setStrokeDasharray, loading } =
    useRouteData();

  const [distance, setDistance] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setStarted(true), 2000);
  }, []);

  useEffect(() => {
    if (!routeMeta || !started) return;

    const startTime = Date.now();
    const updateDistance = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsedTime / duration, 1);
      setStrokeDasharray(
        `${progress * routeMeta.realPathLength} ${routeMeta.realPathLength}`
      );
      setDistance(progress * routeMeta.totalDistance);
    };

    const intervalId = setInterval(updateDistance, 1000 / 60);
    return () => clearInterval(intervalId);
  }, [routeMeta, started, duration, setStrokeDasharray]);

  if (loading || !routeMeta || !svgData) {
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
      <Toolbar
        tileLayerKey={tileLayerKey}
        setTileLayerKey={setTileLayerKey}
        duration={duration}
        setDuration={setDuration}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        showDistance={showDistance}
        setShowDistance={setShowDistance}
      />
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
