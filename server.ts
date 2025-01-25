import Fastify from "fastify";
import { readFileSync } from "fs";
import { join } from "path";

const styles = `
  body {
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }
  svg {
    width: 100%;
    height: 100%;
  }
`;

export function startServer(svgPath: string) {
  const fastify = Fastify({ logger: true });

  fastify.get("/", async (request, reply) => {
    let svg;
    try {
      svg = readFileSync(join(__dirname, svgPath), "utf8");
    } catch (err) {
      fastify.log.error(err);
      svg = "<svg></svg>";
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SVG Viewer</title>
        <style>
          ${styles}
        </style>
      </head>
      <body>
        ${svg}
      </body>
      </html>
    `;

    reply.type("text/html").send(html);
  });

  const start = async () => {
    try {
      await fastify.listen({ port: 3000 });
      console.log("Server is running on http://localhost:3000");
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

  start();

  return fastify;
}
