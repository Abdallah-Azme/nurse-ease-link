import { auth } from "@/auth";
import { PageHeader } from "@/components/app-shell";
import { getPatientsForNurse } from "@/db/queries";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export const metadata = { title: "Messages · CareConnect" };

export default async function NurseChatPage() {
  const session = await auth();
  const patients = await getPatientsForNurse(session!.user.id);

  return (
    <>
      <PageHeader title="Messages" subtitle="Patient conversations." />
      <div className="grid gap-3">
        {patients.map((p) => (
          <Link
            key={p.id}
            href={`/nurse/chat/${p.id}`}
            className="metric-card flex items-center gap-4 hover:bg-accent/30 transition"
          >
            <div
              className="h-10 w-10 rounded-full grid place-items-center text-xs font-semibold text-primary-foreground"
              style={{ background: `oklch(0.55 0.13 ${p.avatarHue})` }}
            >
              {p.name
                .split(" ")
                .map((s) => s[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.conditions.join(", ")}</div>
            </div>
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </>
  );
}
