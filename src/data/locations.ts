import type { Hours } from "@/lib/hours";

export type Location = {
  id: string;
  name: string;
  services: string[];
  street: string;
  city: string;
  zip: string;
  phone: string;
  hours: Hours;
};

export const LOCATIONS: Location[] = [
  {
    id: "82nd-ave",
    name: "82nd Ave",
    services: ["Drive-thru", "Café", "Tanning"],
    street: "1951 SE 82nd Ave",
    city: "Portland",
    zip: "97216",
    phone: "(503) 777-2777",
    hours: { weekdays: [6, 19], saturday: [8, 19], sunday: [8, 19] },
  },
  {
    id: "webster-rd",
    name: "Webster Rd",
    services: ["Café"],
    street: "14813 SE Webster Rd",
    city: "Milwaukie",
    zip: "97267",
    phone: "(503) 654-5177",
    hours: { weekdays: [6, 18], saturday: [7, 18], sunday: [7, 18] },
  },
  {
    id: "powell-blvd",
    name: "Powell Blvd",
    services: ["Drive-thru"],
    street: "3953 SE Powell Blvd",
    city: "Portland",
    zip: "97202",
    phone: "(503) 777-2677",
    hours: { weekdays: [6, 19], saturday: [7, 19], sunday: [7.5, 19] },
  },
];

export const findLocation = (id: string) => LOCATIONS.find((location) => location.id === id);

/** Google Maps directions to the shop; opens the Maps app on phones. */
export const directionsUrl = ({ street, city, zip }: Location) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${street}, ${city}, OR ${zip}`)}`;

export const phoneUrl = ({ phone }: Location) => `tel:+1${phone.replace(/\D/g, "")}`;
