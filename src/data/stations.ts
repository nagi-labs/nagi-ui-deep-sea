import type { ComboboxOption, TableColumn } from "../components/nagi";

export type StationStatus = "Nominal" | "Watch" | "Surfacing";

export interface Station {
  id: string;
  name: string;
  sector: string;
  depth: string;
  temperature: string;
  signal: number;
  signalHistory: readonly number[];
  battery: number;
  capacity: number;
  pressure: string;
  salinity: string;
  drift: string;
  lastPacket: string;
  status: StationStatus;
}

export const signalTimeline = [
  "00:00",
  "02:00",
  "04:00",
  "06:00",
  "08:00",
  "10:00",
  "12:00",
] as const;

export const stations: readonly Station[] = [
  {
    id: "kermadec-07",
    name: "Kermadec 07",
    sector: "Kermadec Trench",
    depth: "9,842 m",
    temperature: "1.7 °C",
    signal: 96,
    signalHistory: [88, 91, 90, 94, 93, 95, 96],
    battery: 78,
    capacity: 61,
    pressure: "99.4 MPa",
    salinity: "34.7 PSU",
    drift: "0.12 kn NE",
    lastPacket: "18 sec ago",
    status: "Nominal",
  },
  {
    id: "clarion-12",
    name: "Clarion 12",
    sector: "Clarion Fracture",
    depth: "5,118 m",
    temperature: "2.1 °C",
    signal: 82,
    signalHistory: [79, 81, 84, 80, 83, 81, 82],
    battery: 64,
    capacity: 43,
    pressure: "51.6 MPa",
    salinity: "34.6 PSU",
    drift: "0.08 kn E",
    lastPacket: "41 sec ago",
    status: "Nominal",
  },
  {
    id: "lau-03",
    name: "Lau 03",
    sector: "Lau Basin",
    depth: "2,930 m",
    temperature: "3.4 °C",
    signal: 64,
    signalHistory: [76, 73, 71, 68, 70, 66, 64],
    battery: 48,
    capacity: 72,
    pressure: "29.7 MPa",
    salinity: "34.5 PSU",
    drift: "0.21 kn SE",
    lastPacket: "2 min ago",
    status: "Watch",
  },
  {
    id: "mariana-18",
    name: "Mariana 18",
    sector: "Mariana Arc",
    depth: "7,406 m",
    temperature: "1.9 °C",
    signal: 89,
    signalHistory: [84, 86, 85, 88, 90, 88, 89],
    battery: 83,
    capacity: 56,
    pressure: "74.8 MPa",
    salinity: "34.8 PSU",
    drift: "0.06 kn N",
    lastPacket: "27 sec ago",
    status: "Nominal",
  },
  {
    id: "sandwich-04",
    name: "Sandwich 04",
    sector: "South Sandwich",
    depth: "6,210 m",
    temperature: "1.6 °C",
    signal: 71,
    signalHistory: [74, 72, 75, 73, 70, 72, 71],
    battery: 31,
    capacity: 88,
    pressure: "62.5 MPa",
    salinity: "34.6 PSU",
    drift: "0.17 kn SW",
    lastPacket: "1 min ago",
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
