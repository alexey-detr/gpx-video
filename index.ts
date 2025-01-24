import { parse } from "node:path";
import { gpxToSvg } from "./gpx_to_svg.ts";
import { renderSvgAnimation } from "./svg_to_frames.ts";
import { combineFrames } from "./combine_frames.ts";

const gpxFile = "Sandsjöbacka_Trail_90.gpx";
const svgFile = parse(gpxFile).name + ".svg";
const mp4File = parse(gpxFile).name + ".mp4";
const duration = 3;

gpxToSvg(gpxFile, svgFile, duration);
await renderSvgAnimation(svgFile, duration);
await combineFrames(mp4File);
