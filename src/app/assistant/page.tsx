import { redirect } from "next/navigation";
import { Chat } from "@/components/Chat";
import { requireUser } from "@/lib/auth";
import { isPaid } from "@/lib/plan";

export default async function AssistantPage() {
  const user = await requireUser();
  if (!isPaid(user)) redirect("/dashboard");
  return (
    <>
      <h1>AI assistant</h1>
      <p className="muted">Ask about your business, or tell it what&apos;s due. It saves deadlines and emails you before each one.</p>
      <Chat />
    </>
  );
}
