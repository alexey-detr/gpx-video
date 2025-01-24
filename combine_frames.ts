import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export const combineFrames = async (outputFile: string) => {
  const frameDir = "./frames";
  const framePattern = `${frameDir}/frame-%04d.png`;
  const command = `ffmpeg -framerate 60 -i ${framePattern} -c:v libx264 -pix_fmt yuv420p ${outputFile}`;

  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      console.error(`ffmpeg stderr: ${stderr}`);
    }
    console.log(`ffmpeg stdout: ${stdout}`);
  } catch (error: any) {
    console.error(`Error executing ffmpeg: ${error.message}`);
  }
};
