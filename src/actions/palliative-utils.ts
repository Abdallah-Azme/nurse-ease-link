export interface SymptomValues {
  pain: number;
  nausea: number;
  fatigue: number;
  appetite: number;
  sleep: number;
  anxiety: number;
  breathlessness: number;
  notes?: string;
}

export function getAlertLevel(values: SymptomValues) {
  const urgent = values.pain >= 7 || values.breathlessness >= 6 || values.anxiety >= 8;
  const watch = values.pain >= 4 || values.fatigue >= 6 || values.sleep >= 6 || values.nausea >= 5;
  if (urgent) return "urgent" as const;
  if (watch) return "watch" as const;
  return "ok" as const;
}
