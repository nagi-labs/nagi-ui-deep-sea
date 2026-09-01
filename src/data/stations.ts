import type { ComboboxOption, TableColumn } from "../components/nagi";

export type StationStatus = "Nominal" | "Watch" | "Surfacing";

export interface Station {
  id: string;
  name: string;
  sector: string;
  depth: string;
  temperature: string;
  signal: number;
  status: StationStatus;
}

export const stations: readonly Station[] = [
  {
    id: "hadal-07",
    name: "Hadal 07",
    sector: "Kermadec Trench",
    depth: "9,842 m",
    temperature: "1.7 °C",
    signal: 96,
    status: "Nominal",
  },
  {
    id: "pelagia-12",
    name: "Pelagia 12",
    sector: "Clarion Fracture",
    depth: "5,118 m",
    temperature: "2.1 °C",
    signal: 82,
    status: "Nominal",
  },
  {
    id: "nautilus-03",
    name: "Nautilus 03",
    sector: "Lau Basin",
    depth: "2,930 m",
    temperature: "3.4 °C",
    signal: 64,
    status: "Watch",
  },
  {
    id: "nereid-18",
    name: "Nereid 18",
    sector: "Mariana Arc",
    depth: "7,406 m",
    temperature: "1.9 °C",
    signal: 89,
    status: "Nominal",
  },
  {
    id: "umbra-04",
    name: "Umbra 04",
    sector: "South Sandwich",
    depth: "6,210 m",
    temperature: "1.6 °C",
    signal: 71,
    status: "Surfacing",
  },
];

export const stationOptions: readonly ComboboxOption[] = stations.map((station) => ({
  key: station.id,
  label: `${station.name} · ${station.sector}`,
}));

export const stationColumns: readonly TableColumn<Station>[] = [
  { key: "name", label: "Station", rowHeader: true },
  { key: "sector", label: "Sector" },
  { key: "depth", label: "Depth", align: "end" },
  { key: "signal", label: "Signal", align: "end" },
  { key: "status", label: "State" },
];
