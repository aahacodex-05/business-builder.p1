import { readFields, route, sessionResponse } from "@/lib/api";
import { signUpEmployee } from "@/lib/accounts";
import { clientIp } from "@/lib/throttle";

export const POST = route(async (request) => {
  const fields = await readFields(request, "number", "name", "password");
  return sessionResponse(await signUpEmployee(fields, clientIp(request.headers)), 201);
});
