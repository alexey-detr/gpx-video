import { useEffect, useState } from "react";

export type ToolbarSettings = {
  tileLayerKey: string;
  duration: number;
  strokeWidth: number;
  showDistance: boolean;
};

const getSavedToolbarSettings = (): Partial<ToolbarSettings> => {
  try {
    const saved = localStorage.getItem("toolbarSettings");
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Error reading toolbarSettings from localStorage", error);
    return {};
  }
};

export const useToolbarSettings = () => {
  const savedSettings = getSavedToolbarSettings();

  const [tileLayerKey, setTileLayerKey] = useState<string>(
    savedSettings.tileLayerKey || "tracesTrack"
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

  useEffect(() => {
    const settings = { tileLayerKey, duration, strokeWidth, showDistance };
    localStorage.setItem("toolbarSettings", JSON.stringify(settings));
  }, [tileLayerKey, duration, strokeWidth, showDistance]);

  return {
    tileLayerKey,
    setTileLayerKey,
    duration,
    setDuration,
    strokeWidth,
    setStrokeWidth,
    showDistance,
    setShowDistance,
  };
};
