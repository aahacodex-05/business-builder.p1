import { requireStaff, route } from "@/lib/api";
import { markPickedUp } from "@/lib/orders";

export const POST = route(async (request, { params }: { params: Promise<{ id: string }> }) => {
  const staff = await requireStaff(request);
  await markPickedUp((await params).id, staff.role === "employee" ? staff.shop : undefined);
  return new Response(null, { status: 204 });
});
