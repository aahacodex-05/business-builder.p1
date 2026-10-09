import { NextResponse } from "next/server";
import { StaffError } from "@/lib/errors";
import { staffFor, type Session } from "@/lib/staff";

type Handler<Context> = (request: Request, context: Context) => Promise<Response>;

/** Answers a StaffError with its message and status; anything unexpected is logged and answered with a 500. */
export function route<Context>(handler: Handler<Context>) {
  return async (request: Request, context: Context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof StaffError) return NextResponse.json({ error: error.message }, { status: error.status });
      console.error(error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

/** The named fields of the JSON body, each as text ("" when missing). */
export async function readFields<Name extends string>(request: Request, ...names: Name[]) {
  const body: Record<string, unknown> | null = await request.json().catch(() => null);
  const fields = names.map((name) => [name, typeof body?.[name] === "string" ? body[name] : ""]);
  return Object.fromEntries(fields) as Record<Name, string>;
}

export const bearerToken = (request: Request) => request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];

/** The staff member behind the request's `Authorization: Bearer` token. The app never uses cookies. */
export async function requireStaff(request: Request) {
  const staff = await staffFor(bearerToken(request));
  if (!staff) throw new StaffError("Please sign in.", 401);
  return staff;
}

export async function requireOwner(request: Request) {
  const staff = await requireStaff(request);
  if (staff.role !== "owner") throw new StaffError("Only the owner can do that.", 403);
}

export const sessionResponse = ({ token, staff }: Session, status = 200) =>
  NextResponse.json({ token, staff }, { status });
