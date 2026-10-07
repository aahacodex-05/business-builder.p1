import { NextResponse } from "next/server";
import { isStaffRequest } from "@/lib/staff";

/** Checks the passcode the app's staff sign-in sends. */
export function GET(request: Request) {
  return isStaffRequest(request)
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "That passcode isn't right." }, { status: 401 });
}
