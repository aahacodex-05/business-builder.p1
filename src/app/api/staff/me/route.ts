import { NextResponse } from "next/server";
import { requireStaff, route } from "@/lib/api";

export const GET = route(async (request) => NextResponse.json({ staff: await requireStaff(request) }));
