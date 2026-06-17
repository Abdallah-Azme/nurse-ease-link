import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { nurseChat, currentUser } from "@/lib/mock-data";
import { useState } from "react";
import { Send, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/patient/chat")({
  head: () => ({ meta: [{ title: "Care team · CareConnect" }] }),
  component: ChatPage,
});

function ChatPage() {
  const [tab, setTab] = useState<"nurse" | "doctor">("nurse");
  const [msgs, setMsgs] = useState(nurseChat);
  const [input, setInput] = useState("");
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMsgs((m) => [...m, { id: crypto.randomUUID(), from: "me", text: input, time: "now" }]);
    setInput("");
  };
  return (
    <>
      <PageHeader title="Care team" subtitle="Secure messages with your assigned nurse and doctor." />
      <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-[calc(100vh-260px)] min-h-[480px]">
        <div className="flex border-b">
          {(["nurse", "doctor"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Stethoscope className="h-4 w-4" /> {t === "nurse" ? "Nurse Jordan" : "Dr. Mei Chen"}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {(tab === "nurse" ? msgs : [{ id: "d1", from: "them" as const, text: "Hi Amelia, I reviewed your latest BP readings — let's discuss at your appointment Thursday.", time: "Yesterday" }]).map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {m.text}
                <div className={`text-[10px] mt-1 ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="border-t p-3 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${tab === "nurse" ? "Jordan" : "Dr. Chen"}…`} className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90"><Send className="h-4 w-4" /></button>
        </form>
      </div>
      <p className="text-xs text-muted-foreground mt-3">Signed in as {currentUser.patient.name}. Messages are not for emergencies — use the Emergency button.</p>
    </>
  );
}
