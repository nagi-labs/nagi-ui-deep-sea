import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ownedRoot = path.join(repositoryRoot, "src/components/nagi");
const expectedComponents = [
  "badge",
  "button",
  "card",
  "carousel",
  "combobox",
  "dialog",
  "meter",
  "sidebar",
  "sidebar-link",
  "sidebar-section",
  "skeleton",
  "table",
  "toast",
];

const actualComponents = fs
  .readdirSync(ownedRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (JSON.stringify(actualComponents) !== JSON.stringify(expectedComponents)) {
  throw new Error(
    `Owned component inventory changed. Expected ${expectedComponents.length}, received ${actualComponents.length}.`,
  );
}

const sourceFiles = expectedComponents.flatMap((component) =>
  fs
    .readdirSync(path.join(ownedRoot, component), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(ownedRoot, component, entry.name)),
);

const missingMarkers = sourceFiles.filter((file) => {
  const firstLine = fs.readFileSync(file, "utf8").split("\n", 1)[0];
  return !firstLine.includes("@nagi-source");
});

if (missingMarkers.length > 0) {
  throw new Error(
    `Owned source provenance is missing:\n${missingMarkers.map((file) => path.relative(repositoryRoot, file)).join("\n")}`,
  );
}

console.log(
  `Owned source audit: ${expectedComponents.length} components and ${sourceFiles.length} provenance-marked files.`,
);
