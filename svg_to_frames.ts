import puppeteer from "puppeteer";
import fs from "node:fs/promises";

export const renderSvgAnimation = async (svgFile: string, duration: number) => {
  const outputDir = "./frames"; // Directory to save frames
  const svgFilePath = `file://${import.meta.dirname}/${svgFile}`; // Path to your SVG animation file
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
  await page.goto(svgFilePath);

  await page.evaluate(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body, svg {
        margin: 0;
        background-color: black; /* Set background to black */
        width: 100%;
        height: 100%;
      }
      svg {
        display: block; /* Remove extra margins or padding */
      }
    `;
    if (document.head) {
      document.head.appendChild(style); // Append to <head> if available
    } else if (document.documentElement) {
      document.documentElement.appendChild(style); // Append to root if no <head>
    }
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
