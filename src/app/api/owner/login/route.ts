import { readFields, route, sessionResponse } from "@/lib/api";
import { signInOwner } from "@/lib/accounts";
import { clientIp } from "@/lib/throttle";

export const POST = route(async (request) => {
  const { code } = await readFields(request, "code");
  return sessionResponse(await signInOwner(code, clientIp(request.headers)));
});
