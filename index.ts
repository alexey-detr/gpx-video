import { parse } from "node:path";
import { gpxToSvg } from "./gpx_to_svg.ts";
import { renderSvgAnimation } from "./svg_to_frames.ts";
import { combineFrames } from "./combine_frames.ts";
import { startServer } from "./server.ts";

const gpxFile = "Sandsjöbacka_Trail_90.gpx";
// const gpxFile = "Stockholm-Gothenburg.gpx";
const svgFile = parse(gpxFile).name + ".svg";
const mp4File = parse(gpxFile).name + ".mp4";
const duration = 30;

gpxToSvg(gpxFile, svgFile, duration);
const server = startServer(svgFile);

await renderSvgAnimation(svgFile, duration);
await combineFrames(mp4File);

await server.close();
process.exit(0);
