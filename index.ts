import { copyFileSync } from "node:fs";
import { parse } from "node:path";
import { combineFrames } from "./combine_frames.ts";
import { gpxToSvg } from "./gpx_to_svg.ts";
import { renderSvgAnimation } from "./svg_to_frames.ts";

const gpxFile = "data/Sandsjöbacka_Trail_90.gpx";
// const gpxFile = "Stockholm-Gothenburg.gpx";
const svgFile = "data/" + parse(gpxFile).name + ".svg";
const jsonFile = "data/" + parse(gpxFile).name + ".json";
// const mp4File = "data/" + parse(gpxFile).name + ".mp4";

gpxToSvg(gpxFile, svgFile);

copyFileSync(svgFile, "app/public/route.svg");
copyFileSync(jsonFile, "app/public/route.meta.json");

// await renderSvgAnimation(duration);
// await combineFrames(mp4File);
