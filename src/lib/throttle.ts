import { db } from "@/lib/db";
import { StaffError } from "@/lib/errors";

/** What is limited, how many tries it gets, and within how many seconds. */
type Limit = [key: string, max: number, seconds: number];

/**
 * Counts one try against each limit and refuses once any of them is used up. Returns a function that
 * gives the tries back after a success, so only failed ones add up.
 */
export async function guard(...limits: Limit[]) {
  const sql = await db();
  const windows = limits.map(([key, max, seconds]) => {
    const length = seconds * 1000;
    return { key, max, start: new Date(Math.floor(Date.now() / length) * length) };
  });

  await sql`delete from attempts where window_start < now() - interval '1 day'`;
  // One atomic upsert per limit, so a burst of parallel tries can't slip past the count.
  const counts = await Promise.all(
    windows.map(
      ({ key, start }) => sql<{ count: number }[]>`
        insert into attempts (key, window_start) values (${key}, ${start})
        on conflict (key, window_start) do update set count = attempts.count + 1
        returning count`,
    ),
  );
  if (counts.some(([{ count }], i) => count > windows[i].max)) {
    throw new StaffError("Too many tries. Please wait a few minutes and try again.", 429);
  }

  return async () => {
    await Promise.all(
      windows.map(
        ({ key, start }) => sql`update attempts set count = count - 1 where key = ${key} and window_start = ${start}`,
      ),
    );
  };
}

/** Where a request came from, as the host reports it (Vercel sets both headers itself). */
export function clientIp(headers: { get(name: string): string | null }) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0];
  return (headers.get("x-real-ip") ?? forwarded ?? "unknown").trim().slice(0, 64);
}
