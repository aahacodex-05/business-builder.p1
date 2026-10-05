const TIME_ZONE = "America/Los_Angeles";

/** [open, close] in 24h shop-local time, indexed Sunday..Saturday. */
const HOURS: [number, number][] = [[8, 19], [6, 19], [6, 19], [6, 19], [6, 19], [6, 19], [8, 19]];

export const HOURS_LABELS = [
  { days: "Mon – Fri", time: "6:00 AM – 7:00 PM" },
  { days: "Sat – Sun", time: "8:00 AM – 7:00 PM" },
];

export function isOpen(date = new Date()) {
  const local = new Date(date.toLocaleString("en-US", { timeZone: TIME_ZONE }));
  const [open, close] = HOURS[local.getDay()];
  const hour = local.getHours() + local.getMinutes() / 60;
  return hour >= open && hour < close;
}
