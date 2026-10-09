import { requireOwner, route } from "@/lib/api";
import { revokeEmployee } from "@/lib/employees";

/** Revokes an employee's access, or an employee number nobody has used yet. */
export const DELETE = route(async (request, { params }: { params: Promise<{ id: string }> }) => {
  await requireOwner(request);
  await revokeEmployee((await params).id);
  return new Response(null, { status: 204 });
});
