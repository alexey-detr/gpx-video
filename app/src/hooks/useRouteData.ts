import { useEffect, useState } from "react";

export type RouteMeta = {
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

export type SVGData = {
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

export const useRouteData = () => {
  const [svgData, setSvgData] = useState<SVGData | null>(null);
  const [routeMeta, setRouteMeta] = useState<RouteMeta | null>(null);
  const [strokeDasharray, setStrokeDasharray] = useState<string>("0 0");
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { svgData, routeMeta, strokeDasharray, setStrokeDasharray, loading };
};
