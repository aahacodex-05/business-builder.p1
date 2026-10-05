export type Location = {
  id: string;
  name: string;
  street: string;
  city: string;
  mapUrl: string;
};

// TODO: replace with real addresses and map links.
export const LOCATIONS: Location[] = [
  { id: "location-1", name: "Location One", street: "Street address", city: "City, OR 97000", mapUrl: "#" },
  { id: "location-2", name: "Location Two", street: "Street address", city: "City, OR 97000", mapUrl: "#" },
  { id: "location-3", name: "Location Three", street: "Street address", city: "City, OR 97000", mapUrl: "#" },
];

export const findLocation = (id: string) => LOCATIONS.find((location) => location.id === id);
