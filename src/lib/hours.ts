const TIME_ZONE = "America/Los_Angeles";

/** [open, close] in 24h shop-local time; 7.5 is 7:30 AM. */
type Span = [open: number, close: number];

export type Hours = { weekdays: Span; saturday: Span; sunday: Span };

/** Shop-local wall-clock time; only its day and time of day are meaningful. */
const localTime = (date: Date) => new Date(date.toLocaleString("en-US", { timeZone: TIME_ZONE }));

export function isOpen(hours: Hours, date = new Date()) {
  const local = localTime(date);
  const day = local.getDay();
  const [open, close] = day === 0 ? hours.sunday : day === 6 ? hours.saturday : hours.weekdays;
  const hour = local.getHours() + local.getMinutes() / 60;
  return hour >= open && hour < close;
}

export function hoursLabels({ weekdays, saturday, sunday }: Hours) {
  const weekend =
    saturday.join() === sunday.join()
      ? [{ days: "Sat – Sun", time: formatSpan(saturday) }]
      : [
          { days: "Sat", time: formatSpan(saturday) },
          { days: "Sun", time: formatSpan(sunday) },
        ];
  return [{ days: "Mon – Fri", time: formatSpan(weekdays) }, ...weekend];
}

/** Midnight at the shops today. On daylight-saving changeover days it's an hour off, still outside opening hours. */
export function startOfDay(date = new Date()) {
  const local = localTime(date);
  const sinceMidnight = ((local.getHours() * 60 + local.getMinutes()) * 60 + local.getSeconds()) * 1000;
  return new Date(Math.floor(date.getTime() / 1000) * 1000 - sinceMidnight);
}

export const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { timeZone: TIME_ZONE, hour: "numeric", minute: "2-digit" });

export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", { timeZone: TIME_ZONE, month: "short", day: "numeric" });

const formatSpan = ([open, close]: Span) => `${formatHour(open)} – ${formatHour(close)}`;

const formatHour = (hour: number) =>
  `${Math.floor(hour) % 12 || 12}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
