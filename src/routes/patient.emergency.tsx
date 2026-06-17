import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app-shell";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Phone, Stethoscope } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/patient/emergency")({
  head: () => ({ meta: [{ title: "Emergency · CareConnect" }] }),
  component: EmergencyPage,
});

const QUESTIONS = [
  { q: "Are you experiencing chest pain or pressure?", opts: ["Yes", "No"] },
  { q: "Are you having difficulty breathing?", opts: ["Yes", "No"] },
  { q: "Do you feel faint or have you lost consciousness?", opts: ["Yes, briefly", "No"] },
  { q: "Rate your symptoms severity", opts: ["Mild", "Moderate", "Severe"] },
];

function EmergencyPage() {
  const [step, setStep] = useState<"idle" | "assess" | "sent">("idle");
  const [answers, setAnswers] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  const trigger = () => {
    setStep("assess");
    setAnswers([]);
    setIdx(0);
  };
  const answer = (opt: string) => {
    const next = [...answers, opt];
    setAnswers(next);
    if (idx + 1 < QUESTIONS.length) setIdx(idx + 1);
    else {
      setStep("sent");
      toast.success("Care team notified", { description: "Nurse Jordan and Dr. Chen have been alerted." });
    }
  };

  return (
    <>
      <PageHeader title="Emergency assistance" subtitle="Use this if you feel something is seriously wrong. Your care team is notified immediately." />

      {step === "idle" && (
        <div className="metric-card border-destructive/30 bg-gradient-to-br from-destructive/5 to-card">
          <div className="text-center py-8">
            <div className="mx-auto h-20 w-20 rounded-full bg-destructive/15 grid place-items-center mb-4">
              <AlertTriangle className="h-9 w-9 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-semibold">Need help now?</h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">Tap the button below to alert your assigned nurse and doctor. We'll guide you through a quick assessment.</p>
            <button onClick={trigger} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-destructive text-destructive-foreground px-8 py-5 text-lg font-semibold hover:bg-destructive/90 shadow-lg shadow-destructive/20 transition active:scale-[0.98]">
              <AlertTriangle className="h-6 w-6" /> Activate Emergency
            </button>
            <div className="mt-6 text-xs text-muted-foreground">For life-threatening situations, call your local emergency number.</div>
          </div>
        </div>
      )}

      {step === "assess" && (
        <div className="metric-card max-w-2xl">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Question {idx + 1} of {QUESTIONS.length}</div>
          <h3 className="font-display text-xl font-semibold mt-2">{QUESTIONS[idx].q}</h3>
          <div className="grid gap-2 mt-5">
            {QUESTIONS[idx].opts.map((o) => (
              <button key={o} onClick={() => answer(o)} className="w-full text-left rounded-xl border bg-background px-4 py-3 text-sm font-medium hover:bg-accent hover:border-primary transition">
                {o}
              </button>
            ))}
          </div>
          <div className="mt-5 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${((idx + 1) / QUESTIONS.length) * 100}%` }} />
          </div>
        </div>
      )}

      {step === "sent" && (
        <div className="metric-card max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-success/15 grid place-items-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">Care team notified</h3>
              <p className="text-sm text-muted-foreground mt-1">Nurse Jordan Reyes and Dr. Mei Chen have received your alert. They'll reach out shortly.</p>
            </div>
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-muted-foreground">While you wait</div>
              <ul className="text-sm mt-2 space-y-1 list-disc pl-4">
                <li>Sit or lie down in a comfortable position</li>
                <li>Loosen tight clothing</li>
                <li>Stay calm and breathe slowly</li>
                <li>Keep your phone nearby</li>
              </ul>
            </div>
            <div className="rounded-xl border p-4 bg-accent/30">
              <div className="text-xs text-muted-foreground">Your responses</div>
              <ul className="text-sm mt-2 space-y-1">
                {QUESTIONS.map((q, i) => (
                  <li key={i}><span className="text-muted-foreground">{q.q.slice(0, 40)}…</span> <strong>{answers[i]}</strong></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90"><Phone className="h-4 w-4" /> Call nurse</button>
            <button className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent"><Stethoscope className="h-4 w-4" /> Message doctor</button>
            <button onClick={() => setStep("idle")} className="ml-auto rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground">Close</button>
          </div>
        </div>
      )}
    </>
  );
}
