import { copyFileSync } from "node:fs";
import { parse } from "node:path";
import { gpxToSvg } from "./gpx_to_svg.ts";

const gpxFile = "data/Stockholm-Gothenburg.gpx";
const svgFile = "data/" + parse(gpxFile).name + ".svg";
const jsonFile = "data/" + parse(gpxFile).name + ".json";

gpxToSvg(gpxFile, svgFile);

copyFileSync(svgFile, "app/public/route.svg");
copyFileSync(jsonFile, "app/public/route.meta.json");
