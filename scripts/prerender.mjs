import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientDirectory = resolve(projectRoot, "dist");
const serverDirectory = resolve(projectRoot, ".ssr");
const template = await readFile(resolve(clientDirectory, "index.html"), "utf8");
const { render } = await import(pathToFileURL(resolve(serverDirectory, "entry-server.js")).href);

const routes = [
  "/",
  "/components",
  "/carousel-contract",
  "/combobox-contract",
  "/dialog-contract",
  "/toast-contract",
];

for (const route of routes) {
  const markup = await render(route);
  const html = template.replace('<div id="app"></div>', `<div id="app">${markup}</div>`);
  const outputs =
    route === "/"
      ? [resolve(clientDirectory, "index.html")]
      : [
          resolve(clientDirectory, `${route.slice(1)}.html`),
          resolve(clientDirectory, route.slice(1), "index.html"),
        ];

  for (const output of outputs) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html);
  }
}

await rm(serverDirectory, { recursive: true, force: true });
