import { z } from "zod";
import { askAssistant } from "@/lib/assistant";
import { getUser } from "@/lib/auth";
import { isPaid } from "@/lib/plan";

const body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) }))
    .min(1)
    .max(40),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  if (!isPaid(user)) return Response.json({ error: "The AI assistant is included with an active plan." }, { status: 402 });

  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });

  const reply = await askAssistant(user, parsed.data.messages);
  return Response.json({ reply });
}
