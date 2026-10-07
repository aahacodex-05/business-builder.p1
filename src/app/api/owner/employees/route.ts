import { NextResponse } from "next/server";
import { readFields, requireOwner, route } from "@/lib/api";
import { addEmployeeNumber, listEmployees } from "@/lib/employees";

export const GET = route(async (request) => {
  await requireOwner(request);
  return NextResponse.json({ employees: await listEmployees() });
});

/** Issues a new employee number for a shop. */
export const POST = route(async (request) => {
  await requireOwner(request);
  const { shop } = await readFields(request, "shop");
  return NextResponse.json({ employee: await addEmployeeNumber(shop) }, { status: 201 });
});
