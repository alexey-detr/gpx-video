import { XMLParser } from "fast-xml-parser";
import fs, { writeFileSync } from "fs";

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
 * Calculate the total distance of the path in kilometers.
 */
function calculateTotalDistance(points: GPXPoint[]): number {
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const [lon1, lat1] = points[i - 1];
    const [lon2, lat2] = points[i];
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }
  return totalDistance;
}

/**
 * Create an SVG animation from a list of points.
 */
function createSvgAnimation(points: GPXPoint[], outputFile: string): void {
  // Define canvas size and scale
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Calculate the center of the route
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

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
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;

  // Path data
  const pathData = [
    `M ${scaledPoints[0][0]} ${scaledPoints[0][1]}`,
    ...scaledPoints.slice(1).map((p) => `L ${p[0]} ${p[1]}`),
  ].join(" ");
  svgContent += `<path d="${pathData}" fill="none" stroke-linecap="round" stroke-linejoin="round">\n`;

  // Calculate real path length
  const realPathLength = calculatePathLength(scaledPoints);

  svgContent += `</path>\n`;

  svgContent += `</svg>`;

  // Save SVG
  fs.writeFileSync(outputFile, svgContent);
  console.log(`SVG animation saved to ${outputFile}`);

  // Calculate total distance
  const totalDistance = calculateTotalDistance(points);

  // Generate metadata JSON
  const metadata = {
    minLat,
    maxLat,
    minLon,
    maxLon,
    center: {
      lat: centerLat,
      lon: centerLon,
    },
    totalDistance,
    realPathLength,
  };

  // Write metadata to JSON file
  const jsonOutputFile = outputFile.replace(".svg", ".json");
  writeFileSync(jsonOutputFile, JSON.stringify(metadata, null, 2));
}

export function gpxToSvg(gpxFile: string, svgFile: string) {
  // Parse GPX and create animation
  const gpxPoints = parseGpx(gpxFile);
  createSvgAnimation(gpxPoints, svgFile);
}
