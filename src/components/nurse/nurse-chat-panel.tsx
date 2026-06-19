"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { markThreadAsRead, sendMessage } from "@/actions/messages";

type Msg = {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
};

export function NurseChatPanel({
  threadId,
  patientId,
  patientName,
  messages,
  currentUserId,
}: {
  threadId: string;
  patientId: string;
  patientName: string;
  messages: Msg[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");

  useEffect(() => {
    void markThreadAsRead(threadId);
  }, [threadId]);

  const display = messages.map((m) => ({
    id: m.id,
    from: m.senderId === currentUserId ? ("me" as const) : ("them" as const),
    text: m.body,
    time: m.createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  }));

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const result = await sendMessage(patientId, input);
    if (result.ok) {
      setInput("");
      router.refresh();
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-[calc(100vh-260px)] min-h-[480px]">
      <div className="px-5 py-3 border-b font-medium">{patientName}</div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {display.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              {m.text}
              <div
                className={`text-[10px] mt-1 ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
              >
                {m.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${patientName.split(" ")[0]}…`}
          className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
