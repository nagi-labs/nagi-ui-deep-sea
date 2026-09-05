import { componentGroups } from "./components";

export interface SourceFile {
  id: string;
  ownerId: string;
  ownerLabel: string;
  label: string;
  path: string;
  description: string;
  language: "CSS" | "TypeScript" | "Vue SFC";
  code: string;
  githubUrl: string;
}

const repositorySourceUrl = "https://github.com/nagi-labs/nagi-ui-deep-sea/blob/main/";

const ownedSourceModules = import.meta.glob<string>("../components/nagi/**/*.{ts,vue}", {
  eager: true,
  import: "default",
  query: "?raw",
});

const applicationSourceModules = import.meta.glob<string>(
  [
    "../App.vue",
    "../components/DashboardSkeleton.vue",
    "../components/SignalQualityCard.vue",
    "../composables/useUserReducedMotion.ts",
    "./stations.ts",
    "../theme/deep-sea.css",
    "../views/ComponentSourceView.vue",
    "../views/DashboardView.vue",
  ],
  {
    eager: true,
    import: "default",
    query: "?raw",
  },
);

const sourceModules = { ...ownedSourceModules, ...applicationSourceModules };

function projectPath(modulePath: string) {
  if (modulePath.startsWith("./")) return `src/data/${modulePath.slice(2)}`;
  return `src/${modulePath.replace(/^\.\.\//u, "")}`;
}

function sourceCode(modulePath: string) {
  const code = sourceModules[modulePath];
  if (code === undefined) throw new Error(`Source module is missing: ${modulePath}`);
  return code;
}

function sourceLanguage(path: string): SourceFile["language"] {
  if (path.endsWith(".vue")) return "Vue SFC";
  if (path.endsWith(".css")) return "CSS";
  return "TypeScript";
}

function defineSourceFile(
  input: Omit<SourceFile, "code" | "githubUrl" | "language" | "path"> & {
    modulePath: string;
  },
): SourceFile {
  const path = projectPath(input.modulePath);
  return {
    id: input.id,
    ownerId: input.ownerId,
    ownerLabel: input.ownerLabel,
    label: input.label,
    path,
    description: input.description,
    language: sourceLanguage(path),
    code: sourceCode(input.modulePath),
    githubUrl: `${repositorySourceUrl}${path}`,
  };
}

export const pageSourceFiles = [
  defineSourceFile({
    id: "page-dashboard-view",
    ownerId: "deep-sea-application",
    ownerLabel: "Deep Sea application",
    label: "DashboardView.vue",
    modulePath: "../views/DashboardView.vue",
    description: "The Overview composition, behavior wiring, semantic template, and scoped CSS.",
  }),
  defineSourceFile({
    id: "page-signal-quality-card",
    ownerId: "deep-sea-application",
    ownerLabel: "Deep Sea application",
    label: "SignalQualityCard.vue",
    modulePath: "../components/SignalQualityCard.vue",
    description: "The Nagi Card boundary and application-owned Unovis chart surface.",
  }),
  defineSourceFile({
    id: "page-dashboard-skeleton",
    ownerId: "deep-sea-application",
    ownerLabel: "Deep Sea application",
    label: "DashboardSkeleton.vue",
    modulePath: "../components/DashboardSkeleton.vue",
    description: "The stable loading layout assembled from owned Nagi Skeletons.",
  }),
  defineSourceFile({
    id: "page-app-shell",
    ownerId: "deep-sea-application",
    ownerLabel: "Deep Sea application",
    label: "App.vue",
    modulePath: "../App.vue",
    description: "The responsive sidebar shell and routed Motion boundary.",
  }),
  defineSourceFile({
    id: "page-theme",
    ownerId: "deep-sea-application",
    ownerLabel: "Deep Sea application",
    label: "deep-sea.css",
    modulePath: "../theme/deep-sea.css",
    description: "The semantic token values shared by every Deep Sea surface.",
  }),
  defineSourceFile({
    id: "page-station-data",
    ownerId: "deep-sea-application",
    ownerLabel: "Deep Sea application",
    label: "stations.ts",
    modulePath: "./stations.ts",
    description: "Typed content and table column data consumed by the Overview.",
  }),
  defineSourceFile({
    id: "page-source-view",
    ownerId: "deep-sea-application",
    ownerLabel: "Deep Sea application",
    label: "ComponentSourceView.vue",
    modulePath: "../views/ComponentSourceView.vue",
    description: "This source explorer's own page composition and Nagi CSS.",
  }),
] as const;

function componentDirectory(component: string) {
  return component.replace(/([a-z0-9])([A-Z])/gu, "$1-$2").toLowerCase();
}

function sourceLabel(modulePath: string) {
  return modulePath.split("/").at(-1) ?? modulePath;
}

function sourceId(component: string, label: string) {
  return `component-${componentDirectory(component)}-${label
    .replace(/[^a-z0-9]+/giu, "-")
    .replace(/^-|-$/gu, "")
    .toLowerCase()}`;
}

export const componentSourceFiles = componentGroups.flatMap((group) =>
  group.components.flatMap((component) => {
    const directory = componentDirectory(component);
    const prefix = `../components/nagi/${directory}/`;
    return Object.keys(ownedSourceModules)
      .filter((modulePath) => modulePath.startsWith(prefix))
      .sort((left, right) => {
        const leftIsVue = left.endsWith(".vue");
        const rightIsVue = right.endsWith(".vue");
        if (leftIsVue !== rightIsVue) return leftIsVue ? -1 : 1;
        return left.localeCompare(right);
      })
      .map((modulePath) => {
        const label = sourceLabel(modulePath);
        return defineSourceFile({
          id: sourceId(component, label),
          ownerId: `component-${directory}`,
          ownerLabel: `${component} owned source`,
          label,
          modulePath,
          description: label.endsWith(".vue")
            ? `The owned ${component} Vue template, behavior wiring, and scoped CSS.`
            : label.includes("definition")
              ? `The ${component} Definition adopted by this implementation.`
              : `The owned ${component} presentation composable used by its Vue template.`,
        });
      });
  }),
);

export const ownedSourceFileCount = componentSourceFiles.length;

export const sourceFiles: readonly SourceFile[] = [...pageSourceFiles, ...componentSourceFiles];

export const defaultSourceId = pageSourceFiles[0].id;

export function findSourceFile(id: string | undefined) {
  return sourceFiles.find((source) => source.id === id) ?? pageSourceFiles[0];
}

export function sourceFilesForOwner(ownerId: string) {
  return sourceFiles.filter((source) => source.ownerId === ownerId);
}

export function primaryComponentSourceId(component: string) {
  const ownerId = `component-${componentDirectory(component)}`;
  return sourceFiles.find((source) => source.ownerId === ownerId && source.path.endsWith(".vue"))
    ?.id;
}
