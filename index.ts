import { parse } from "node:path";
import { gpxToSvg } from "./gpx_to_svg.ts";
import { renderSvgAnimation } from "./svg_to_frames.ts";
import { combineFrames } from "./combine_frames.ts";
import { startServer } from "./server.ts";
import { copyFileSync } from "node:fs";

const gpxFile = "data/Sandsjöbacka_Trail_90.gpx";
// const gpxFile = "Stockholm-Gothenburg.gpx";
const svgFile = "data/" + parse(gpxFile).name + ".svg";
const jsonFile = "data/" + parse(gpxFile).name + ".json";
const mp4File = "data/" + parse(gpxFile).name + ".mp4";
const duration = 30;

gpxToSvg(gpxFile, svgFile, duration);
// const server = startServer(svgFile);
//
// await renderSvgAnimation(svgFile, duration);
// await combineFrames(mp4File);

copyFileSync(svgFile, "app/public/route.svg");
copyFileSync(jsonFile, "app/public/route.meta.json");

// await server.close();
// process.exit(0);
