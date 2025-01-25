import puppeteer from "puppeteer";
import fs from "node:fs/promises";

export const renderSvgAnimation = async (svgFile: string, duration: number) => {
  const outputDir = "./frames"; // Directory to save frames
  const frameCount = 60 * duration; // Number of frames to render
  const fps = 60;
  const width = 3840;
  const height = 2160;

  // Ensure output directory exists
  await fs.rmdir(outputDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set 4K resolution for rendering
  await page.setViewport({ width, height });

  // Load the SVG animation
  await page.goto("http://localhost:3000");

  // Pause the animation initially
  await page.evaluate(() => {
    const svgElement = document.querySelector("svg");
    svgElement?.pauseAnimations();
  });

  // Render each frame
  for (let i = 0; i < frameCount; i++) {
    const currentTime = (i / fps) * 1000; // Time in milliseconds
    console.log(`Rendering frame ${i + 1}/${frameCount} at ${currentTime}ms`);

    // Progress the animation
    await page.evaluate((time) => {
      const svgElement = document.querySelector("svg");
      svgElement?.setCurrentTime(time / 1000); // Set time in seconds
    }, currentTime);

    // Save the frame as a PNG file
    const framePath = `${outputDir}/frame-${i.toString().padStart(4, "0")}.png`;
    await page.screenshot({ path: framePath });
  }

  await browser.close();
  console.log("Frame rendering complete!");
};
