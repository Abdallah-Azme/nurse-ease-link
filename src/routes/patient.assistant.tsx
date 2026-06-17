import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { useState } from "react";
import { Send, Sparkles, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/patient/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant · CareConnect" }] }),
  component: AssistantPage,
});

type Msg = { id: string; from: "me" | "ai"; text: string };

const STARTERS = [
  "What does a blood pressure of 145/92 mean?",
  "Why do I take Metformin with meals?",
  "What's a normal blood sugar range?",
  "What should I do if I feel dizzy?",
];

const CANNED: Record<string, string> = {
  default: "I'm here to help explain health information — I won't diagnose conditions or prescribe treatments. If something feels urgent, please contact your care team or use the Emergency button.",
};

export function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "1", from: "ai", text: "Hi Amelia — I'm your CareConnect assistant. I can explain readings, medications, and general health topics. I won't diagnose or prescribe. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    const me: Msg = { id: crypto.randomUUID(), from: "me", text };
    setMessages((m) => [...m, me]);
    setInput("");
    setTimeout(() => {
      let reply = CANNED.default;
      const t = text.toLowerCase();
      if (t.includes("blood pressure") || t.includes("145")) reply = "A reading of 145/92 mmHg falls in stage 2 hypertension range. Common causes include stress, salt intake, missed medication, or activity right before the reading. I'd suggest resting 5 minutes and rechecking, and logging it so your nurse can see the trend. I can't diagnose — but if it stays high or you feel chest pain, shortness of breath, or vision changes, use the Emergency button.";
      else if (t.includes("metformin")) reply = "Metformin is taken with meals to reduce stomach upset and to match when your body processes carbohydrates from food. Skipping food can also increase nausea. Please follow your care team's instructions.";
      else if (t.includes("blood sugar")) reply = "For most adults: fasting 80–130 mg/dL, and under 180 mg/dL two hours after meals are typical targets — your doctor may set personalized goals.";
      else if (t.includes("dizzy")) reply = "Dizziness can come from low blood sugar, dehydration, blood pressure changes, or medication side effects. Sit or lie down, sip water, and check your sugar if you have a meter. If it doesn't resolve in a few minutes or you feel faint, contact your nurse or use Emergency.";
      const ai: Msg = { id: crypto.randomUUID(), from: "ai", text: reply };
      setMessages((m) => [...m, ai]);
    }, 600);
  };

  return (
    <>
      <PageHeader title="AI Health Assistant" subtitle="Educational guidance. Never a substitute for medical advice." />

      <div className="rounded-2xl border bg-card flex flex-col h-[calc(100vh-260px)] min-h-[480px] overflow-hidden">
        <div className="px-4 py-3 border-b bg-accent/30 flex items-center gap-2 text-sm">
          <ShieldAlert className="h-4 w-4 text-warning" />
          <span className="text-muted-foreground">This assistant explains and educates — it does <strong className="text-foreground">not</strong> diagnose or prescribe.</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.from === "me" ? "justify-end" : ""}`}>
              {m.from === "ai" && (
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs rounded-full border bg-background px-3 py-1.5 hover:bg-accent">
                {s}
              </button>
            ))}
          </div>
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
              placeholder="Ask about a reading, medication, or symptom…"
              className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
