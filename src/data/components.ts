export const verifiedDefinitions = new Set(["Button", "Carousel", "Dialog", "Toast"]);

export const componentGroups = [
  {
    name: "Actions",
    components: ["Button"],
  },
  {
    name: "Data display",
    components: ["Badge", "Card", "Carousel", "Meter", "Skeleton", "Table"],
  },
  {
    name: "Forms",
    components: ["Combobox"],
  },
  {
    name: "Navigation",
    components: ["Sidebar", "SidebarLink", "SidebarSection"],
  },
  {
    name: "Overlays and feedback",
    components: ["Dialog", "Toast"],
  },
] as const;

export const ownedComponentCount = componentGroups.reduce(
  (total, group) => total + group.components.length,
  0,
);

export const ownedSourceFileCount = 17;
