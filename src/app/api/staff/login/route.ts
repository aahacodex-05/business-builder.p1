import { readFields, route, sessionResponse } from "@/lib/api";
import { signInEmployee } from "@/lib/accounts";
import { clientIp } from "@/lib/throttle";

export const POST = route(async (request) => {
  const { number, password } = await readFields(request, "number", "password");
  return sessionResponse(await signInEmployee(number, password, clientIp(request.headers)));
});
