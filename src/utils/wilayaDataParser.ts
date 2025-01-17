import { Wilayas } from "@/types/types";
import { Option } from "@/components/ui/better-select";

export function parseWilayas(wilayaData: Wilayas) {
  const options: Option[] = Object.entries(wilayaData).map(([key, wilaya]) => {
    return {
      label: key,
      value: wilaya.id,
      disabled: key === "In Guezzam" || key === "Bordj Badji Mokhtar"
    };
  });
  return options;
}

export function parseCommunes(wilayaData: Wilayas, wilayaId: string) {
  const wilaya = Object.values(wilayaData).find(
    (wilaya) => wilaya.id === wilayaId
  );
  if (wilaya) {
    const options: Option[] = wilaya.communes.map((commune) => ({
      label: commune,
      value: commune,
    }));
    return options;
  }
  return undefined;
}

export function parseNoestStations(
  wilayaData: Wilayas,
  wilayaId: string
): Option[] | undefined {
  const wilaya = Object.values(wilayaData).find(
    (wilaya) => wilaya.id === wilayaId
  );
  if (wilaya) {
    return wilaya.noest.stations.map(({ commune, stationCode }) => ({
      label: commune,
      value: stationCode,
    }));
  }
  return undefined; // If no matching wilaya found, return undefined
}
