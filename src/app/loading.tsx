import { LoadingAnimation } from "@/components/loading-animation";

export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <LoadingAnimation />
        <p className="text-sm text-muted-foreground">Loading CareConnect...</p>
      </div>
    </div>
  );
}
