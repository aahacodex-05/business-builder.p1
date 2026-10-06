export type Location = {
  id: string;
  name: string;
  services: string[];
  street: string;
  city: string;
  zip: string;
};

export const LOCATIONS: Location[] = [
  {
    id: "82nd-ave",
    name: "82nd Ave",
    services: ["Drive-thru", "Café", "Tanning"],
    street: "1951 SE 82nd Ave",
    city: "Portland",
    zip: "97216",
  },
  {
    id: "webster-rd",
    name: "Webster Rd",
    services: ["Café"],
    street: "14813 SE Webster Rd",
    city: "Milwaukie",
    zip: "97267",
  },
  {
    id: "powell-blvd",
    name: "Powell Blvd",
    services: ["Drive-thru"],
    street: "3953 SE Powell Blvd",
    city: "Portland",
    zip: "97202",
  },
];

export const findLocation = (id: string) => LOCATIONS.find((location) => location.id === id);

/** Google Maps directions to the shop; opens the Maps app on phones. */
export const directionsUrl = ({ street, city, zip }: Location) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${street}, ${city}, OR ${zip}`)}`;
