import { FC } from "react";
import { TileLayerDescriptor, tileLayers } from "../config/tileLayers";

type ToolbarProps = {
  tileLayerKey: string;
  setTileLayerKey: (key: string) => void;
  duration: number;
  setDuration: (d: number) => void;
  strokeWidth: number;
  setStrokeWidth: (w: number) => void;
  showDistance: boolean;
  setShowDistance: (b: boolean) => void;
};

const Toolbar: FC<ToolbarProps> = ({
  tileLayerKey,
  setTileLayerKey,
  duration,
  setDuration,
  strokeWidth,
  setStrokeWidth,
  showDistance,
  setShowDistance,
}) => {
  return (
    <div className="top-bar-container">
      <div className="top-bar">
        <label>
          Tile Layer:&nbsp;
          <select
            value={tileLayerKey}
            onChange={(e) => setTileLayerKey(e.target.value)}
          >
            {Object.entries(tileLayers).map(
              ([key, provider]: [string, TileLayerDescriptor]) => (
                <option key={key} value={key}>
                  {provider.label}
                </option>
              )
            )}
          </select>
        </label>
        <label>
          Duration:&nbsp;
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>
        <label>
          Stroke Width:&nbsp;
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
  );
};

export default Toolbar;
