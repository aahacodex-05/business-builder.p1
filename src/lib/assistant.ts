import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { User } from "@/db/schema";
import { completeDeadline, createDeadline, deadlineInput, listDeadlines } from "./deadlines";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

const SYSTEM = `You are the AI assistant for The Business Builder, a digital agency that runs websites, Google Business Profiles, social media, local SEO, reviews and ads for small businesses.
Help the client with their business and keep track of their deadlines. When they mention something due, save it with create_deadline so they get email alerts 7 days, 1 day and 1 hour before it is due.
Keep answers short, plain and practical.`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

function deadlineTools(user: User) {
  return [
    betaZodTool({
      name: "list_deadlines",
      description: "List the client's open deadlines, soonest first.",
      inputSchema: z.object({}),
      run: async () => JSON.stringify(await listDeadlines(user.id)),
    }),
    betaZodTool({
      name: "create_deadline",
      description:
        "Save a deadline. The client is emailed 7 days, 1 day and 1 hour before it is due. dueAt must be an ISO 8601 timestamp with a timezone offset.",
      inputSchema: z.object({
        title: z.string(),
        dueAt: z.string().describe("ISO 8601, e.g. 2026-10-14T17:00:00-05:00"),
        notes: z.string().optional(),
      }),
      run: async (input) => {
        const parsed = deadlineInput.safeParse(input);
        if (!parsed.success) return `Not saved: ${parsed.error.issues[0].message}`;
        return JSON.stringify(await createDeadline(user.id, parsed.data));
      },
    }),
    betaZodTool({
      name: "complete_deadline",
      description: "Mark a deadline as done so no more alerts are sent for it.",
      inputSchema: z.object({ id: z.string().uuid() }),
      run: async ({ id }) => ((await completeDeadline(user.id, id)) ? "Marked done." : "Deadline not found."),
    }),
  ];
}

export async function askAssistant(user: User, messages: ChatMessage[]): Promise<string> {
  const message = await new Anthropic().beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      { type: "text", text: `Client: ${user.name}. Their time zone: ${user.timeZone}. Now: ${new Date().toISOString()}.` },
    ],
    tools: deadlineTools(user),
    messages,
  });

  if (message.stop_reason === "refusal") return "Sorry, I can't help with that request.";
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}
