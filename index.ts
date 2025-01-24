import { parse } from "node:path";
import { gpxToSvg } from "./gpx_to_svg.ts";
import { renderSvgAnimation } from "./svg_to_frames.ts";

const gpxFile = "Sandsjöbacka_Trail_90.gpx";
const svgFile = parse(gpxFile).name + ".svg";
const duration = 30;

gpxToSvg(gpxFile, svgFile, duration);
renderSvgAnimation(svgFile, duration);
