import { bearerToken, route } from "@/lib/api";
import { endSession } from "@/lib/staff";

export const POST = route(async (request) => {
  await endSession(bearerToken(request));
  return new Response(null, { status: 204 });
});
