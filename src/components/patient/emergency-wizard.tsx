"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Phone, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { triggerEmergency } from "@/actions/emergencies";

const QUESTIONS = [
  { q: "Are you experiencing chest pain or pressure?", opts: ["Yes", "No"] },
  { q: "Are you having difficulty breathing?", opts: ["Yes", "No"] },
  { q: "Do you feel faint or have you lost consciousness?", opts: ["Yes, briefly", "No"] },
  { q: "Rate your symptoms severity", opts: ["Mild", "Moderate", "Severe"] },
];

export function EmergencyWizard() {
  const [step, setStep] = useState<"idle" | "assess" | "sent">("idle");
  const [answers, setAnswers] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  function start() {
    setStep("assess");
    setAnswers([]);
    setIdx(0);
  }

  async function answer(opt: string) {
    const next = [...answers, opt];
    setAnswers(next);
    if (idx + 1 < QUESTIONS.length) {
      setIdx(idx + 1);
    } else {
      const result = await triggerEmergency(next);
      if (result.ok) {
        setStep("sent");
        toast.success("Care team notified", {
          description: "Your nurse and doctor have been alerted.",
        });
      } else {
        toast.error(result.error);
      }
    }
  }

  if (step === "idle") {
    return (
      <div className="metric-card border-destructive/30 bg-gradient-to-br from-destructive/5 to-card">
        <div className="text-center py-8">
          <div className="mx-auto h-20 w-20 rounded-full bg-destructive/15 grid place-items-center mb-4">
            <AlertTriangle className="h-9 w-9 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-semibold">Need help now?</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Tap the button below to alert your assigned nurse and doctor. We&apos;ll guide you
            through a quick assessment.
          </p>
          <button
            onClick={start}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-destructive text-destructive-foreground px-8 py-5 text-lg font-semibold hover:bg-destructive/90 shadow-lg shadow-destructive/20 transition active:scale-[0.98]"
          >
            <AlertTriangle className="h-6 w-6" /> Activate Emergency
          </button>
          <div className="mt-6 text-xs text-muted-foreground">
            For life-threatening situations, call your local emergency number.
          </div>
        </div>
      </div>
    );
  }

  if (step === "assess") {
    return (
      <div className="metric-card max-w-2xl">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">
          Question {idx + 1} of {QUESTIONS.length}
        </div>
        <h3 className="font-display text-xl font-semibold mt-2">{QUESTIONS[idx].q}</h3>
        <div className="grid gap-2 mt-5">
          {QUESTIONS[idx].opts.map((o) => (
            <button
              key={o}
              onClick={() => answer(o)}
              className="w-full text-left rounded-xl border bg-background px-4 py-3 text-sm font-medium hover:bg-accent hover:border-primary transition"
            >
              {o}
            </button>
          ))}
        </div>
        <div className="mt-5 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((idx + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="metric-card max-w-2xl">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-success/15 grid place-items-center shrink-0">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold">Help is on the way</h2>
          <p className="text-muted-foreground mt-1">
            Your care team has been notified and will contact you shortly. Stay calm and if symptoms
            worsen, call emergency services.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip bg-muted">
              <Stethoscope className="h-3 w-3" /> Nurse notified
            </span>
            <span className="chip bg-muted">
              <Stethoscope className="h-3 w-3" /> Doctor notified
            </span>
          </div>
          <button className="mt-5 inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent">
            <Phone className="h-4 w-4" /> Call care team
          </button>
        </div>
      </div>
    </div>
  );
}
