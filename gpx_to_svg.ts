import { XMLParser } from "fast-xml-parser";
import fs from "fs";

// Define types for GPX points
type GPXPoint = [number, number]; // [longitude, latitude]

/**
 * Calculate the real length of the path in SVG coordinate space.
 */
function calculatePathLength(points: [number, number][]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    length += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); // Euclidean distance
  }
  return length;
}

/**
 * Smooth the path by removing points that are too close to the previous point.
 */
function smoothPath(points: GPXPoint[], threshold: number): GPXPoint[] {
  if (points.length === 0) return [];

  const smoothedPoints: GPXPoint[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = smoothedPoints[smoothedPoints.length - 1];
    const [x2, y2] = points[i];
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    if (distance > threshold) {
      smoothedPoints.push(points[i]);
    }
  }

  return smoothedPoints;
}

/**
 * Parse a GPX file and extract latitude and longitude as a list of tuples.
 */
function parseGpx(filePath: string): GPXPoint[] {
  const gpxContent = fs.readFileSync(filePath, "utf8");
  const parser = new XMLParser({
    ignoreAttributes: false,
  });
  const parsed = parser.parse(gpxContent);

  const trkpts = parsed.gpx.trk.trkseg.trkpt;

  const result = trkpts.map((trkpt: any) => {
    const lat = parseFloat(trkpt["@_lat"]);
    const lon = parseFloat(trkpt["@_lon"]);
    return [lon, lat];
  });

  return smoothPath(result, 0.0001);
}

/**
 * Create an SVG animation from a list of points.
 */
function createSvgAnimation(
  points: GPXPoint[],
  outputFile: string,
  duration: number
): void {
  // Define canvas size and scale
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Convert latitude to Mercator projection
  const mercatorProjection = (lat: number): number =>
    Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

  const minMercatorY = mercatorProjection(minLat);
  const maxMercatorY = mercatorProjection(maxLat);

  // Calculate real-world distance scales
  const latKmPerDegree = 111; // Approx. km per degree of latitude
  const avgLat = (minLat + maxLat) / 2;
  const lonKmPerDegree = 111 * Math.cos((avgLat * Math.PI) / 180);

  // Calculate the area of the bounding box in square kilometers
  const widthKm = (maxLon - minLon) * lonKmPerDegree;
  const heightKm = (maxLat - minLat) * latKmPerDegree;
  const areaKm2 = widthKm * heightKm;

  // Determine stroke width based on area
  const strokeWidth = Math.max(0.1, Math.min(5, 100 / Math.sqrt(areaKm2)));

  // Maintain real-world aspect ratio
  const aspectRatio = widthKm / heightKm;
  let width = 3840; // Base width
  let height = aspectRatio > 1 ? Math.floor(width / aspectRatio) : 800;
  if (aspectRatio <= 1) width = Math.floor(height * aspectRatio);

  // Scaling factors
  const lonScale = width / (maxLon - minLon);
  const latScale = height / (maxMercatorY - minMercatorY);

  // Normalize points to fit within canvas
  const scalePoint = (point: GPXPoint): [number, number] => {
    const [lon, lat] = point;
    const x = (lon - minLon) * lonScale;
    const mercatorY = mercatorProjection(lat);
    const y = height - (mercatorY - minMercatorY) * latScale; // Invert Y-axis
    return [x, y];
  };

  const scaledPoints = points.map(scalePoint);

  // Build SVG content as a string
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="-20 -20 ${
    width + 40
  } ${height + 40}">\n`;

  // Path data
  const pathData = [
    `M ${scaledPoints[0][0]} ${scaledPoints[0][1]}`,
    ...scaledPoints.slice(1).map((p) => `L ${p[0]} ${p[1]}`),
  ].join(" ");
  svgContent += `<path d="${pathData}" fill="none" stroke="red" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">\n`;

  // Calculate real path length
  const realPathLength = calculatePathLength(scaledPoints);

  // Add animation
  svgContent += `
    <animate 
      attributeName="stroke-dasharray" 
      from="0 ${realPathLength}" 
      to="${realPathLength} ${realPathLength}" 
      dur="${duration}s" 
      repeatCount="indefinite" />
  `;
  svgContent += `</path>\n`;

  svgContent += `</svg>`;

  // Save SVG
  fs.writeFileSync(outputFile, svgContent);
  console.log(`SVG animation saved to ${outputFile}`);
}

export function gpxToSvg(gpxFile: string, svgFile: string, duration: number) {
  // Parse GPX and create animation
  const gpxPoints = parseGpx(gpxFile);
  createSvgAnimation(gpxPoints, svgFile, duration);
}
