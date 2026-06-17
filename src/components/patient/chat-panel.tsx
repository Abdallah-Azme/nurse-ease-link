"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send, Stethoscope } from "lucide-react";

import { sendMessage } from "@/actions/messages";

type Msg = {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
};

export function ChatPanel({
  patientId,
  nurseId,
  nurseName,
  doctorId,
  doctorName,
  initialNurseMessages,
  initialDoctorMessage,
  currentUserId,
}: {
  patientId: string;
  nurseId: string;
  nurseName: string;
  doctorId: string;
  doctorName: string;
  initialNurseMessages: Msg[];
  initialDoctorMessage: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"nurse" | "doctor">("nurse");
  const [input, setInput] = useState("");

  const nurseMsgs = initialNurseMessages.map((m) => ({
    id: m.id,
    from: m.senderId === currentUserId ? ("me" as const) : ("them" as const),
    text: m.body,
    time: m.createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  }));

  const doctorMsgs = [
    {
      id: "d1",
      from: "them" as const,
      text: initialDoctorMessage,
      time: "Yesterday",
    },
  ];

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const recipientId = tab === "nurse" ? nurseId : doctorId;
    const result = await sendMessage(recipientId, input);
    if (result.ok) {
      setInput("");
      router.refresh();
    }
  }

  const display = tab === "nurse" ? nurseMsgs : doctorMsgs;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-[calc(100vh-260px)] min-h-[480px]">
      <div className="flex border-b">
        {(["nurse", "doctor"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Stethoscope className="h-4 w-4" /> {t === "nurse" ? nurseName : doctorName}
          </button>
        ))}
      </div>
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
          placeholder={`Message ${tab === "nurse" ? nurseName.split(" ")[0] : doctorName.split(" ")[1]}…`}
          className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
