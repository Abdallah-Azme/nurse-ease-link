import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { patients } from "@/lib/mock-data";
import { useState } from "react";
import { Send } from "lucide-react";

export const Route = createFileRoute("/nurse/chat")({
  head: () => ({ meta: [{ title: "Messages · CareConnect" }] }),
  component: NurseChat,
});

function NurseChat() {
  const [active, setActive] = useState(patients[0].id);
  const p = patients.find((x) => x.id === active)!;
  return (
    <>
      <PageHeader title="Messages" subtitle="Conversations with your patients." />
      <div className="grid md:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-260px)] min-h-[480px]">
        <div className="rounded-2xl border bg-card overflow-y-auto">
          {patients.filter(p => p.assignedNurseId === "n1").map((p) => (
            <button key={p.id} onClick={() => setActive(p.id)} className={`w-full text-left px-3 py-3 flex items-center gap-3 border-b last:border-0 ${active === p.id ? "bg-accent" : "hover:bg-muted/50"}`}>
              <div className="h-9 w-9 rounded-full grid place-items-center text-xs font-semibold text-primary-foreground" style={{ background: `oklch(0.55 0.13 ${p.avatarHue})` }}>{p.name.split(" ").map(s => s[0]).join("").slice(0,2)}</div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.conditions[0]}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-2xl border bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b">
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-muted-foreground">{p.conditions.join(", ")}</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex"><div className="max-w-[75%] rounded-2xl bg-muted px-4 py-2 text-sm">Good morning — how are you feeling today?</div></div>
            <div className="flex justify-end"><div className="max-w-[75%] rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm">A bit tired, BP felt elevated this morning.</div></div>
            <div className="flex"><div className="max-w-[75%] rounded-2xl bg-muted px-4 py-2 text-sm">Thanks for the update. Please log it and rest 30 minutes — I'll review.</div></div>
          </div>
          <form className="border-t p-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Type a message…" className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button className="rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      </div>
    </>
  );
}
