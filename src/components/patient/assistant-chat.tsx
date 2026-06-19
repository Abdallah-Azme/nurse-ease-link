"use client";

import { useState, useTransition } from "react";
import { Loader2, Send, ShieldAlert, Sparkles } from "lucide-react";

import { sendAssistantMessage } from "@/actions/assistant";

type Msg = { id: string; from: "me" | "ai"; text: string };

const STARTERS = [
  "What does a blood pressure of 145/92 mean?",
  "Why do I take Metformin with meals?",
  "What's a normal blood sugar range?",
  "What should I do if I feel dizzy?",
];

export function AssistantChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "1",
      from: "ai",
      text: "Hi, I'm your CareConnect assistant. Ask me about readings, medications, or general health questions, and I'll keep it educational and safe.",
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    const me: Msg = { id: crypto.randomUUID(), from: "me", text: trimmed };
    setMessages((current) => [...current, me]);
    setInput("");
    setError(null);

    startTransition(async () => {
      const result = await sendAssistantMessage(trimmed);
      if (!result.ok) {
        setError(result.message);
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            from: "ai",
            text: "I couldn't reach the assistant right now. Please try again in a moment, or use the care team chat if this is urgent.",
          },
        ]);
        return;
      }

      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), from: "ai", text: result.data.reply },
      ]);
    });
  }

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[480px] flex-col overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center gap-2 border-b bg-accent/30 px-4 py-3 text-sm">
        <ShieldAlert className="h-4 w-4 text-warning" />
        <span className="text-muted-foreground">
          This assistant explains and educates. It does not diagnose, prescribe, or replace your
          clinician.
        </span>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.from === "me" ? "justify-end" : ""}`}>
            {m.from === "ai" ? (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
            ) : null}
            <div
              className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border bg-background px-3 py-1.5 text-xs hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>
        {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a reading, medication, or symptom..."
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
