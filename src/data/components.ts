export const testedContractEvidence = {
  Button: { runner: "buttonContract", test: "tests/button.spec.ts" },
  Carousel: { runner: "carouselContract", test: "tests/carousel-contract.spec.ts" },
  Combobox: { runner: "comboboxContract", test: "tests/combobox.spec.ts" },
  Dialog: { runner: "dialogContract", test: "tests/dialog.spec.ts" },
  Toast: { runner: "toastContract", test: "tests/toast.spec.ts" },
} as const;

export const testedContracts = new Set<string>(Object.keys(testedContractEvidence));

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
