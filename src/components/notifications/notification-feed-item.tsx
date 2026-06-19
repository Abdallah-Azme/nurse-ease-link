"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, MessageCircle, Check } from "lucide-react";
import { toast } from "sonner";

import { readNotification } from "@/actions/notifications";

export function NotificationFeedItem({
  item,
}: {
  item: {
    id: string;
    type: "alert" | "message" | "system";
    title: string;
    body: string;
    url: string;
    unread: boolean;
  };
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-background/40 p-3 transition hover:bg-accent/30">
      <Link href={item.url} className="flex flex-1 items-start gap-3 min-w-0">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          {item.type === "message" ? (
            <MessageCircle className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium">{item.title}</div>
            {item.unread && <span className="chip bg-destructive/10 text-destructive">new</span>}
          </div>
          <div className="truncate text-sm text-muted-foreground">{item.body}</div>
        </div>
      </Link>
      {item.unread && (
        <button
          type="button"
          disabled={pending}
          className="rounded-full border px-3 py-2 text-xs font-medium hover:bg-accent disabled:opacity-60"
          onClick={() =>
            startTransition(async () => {
              const result = await readNotification(item.id);
              if (!result.ok) toast.error(result.message);
            })
          }
        >
          <span className="inline-flex items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            Read
          </span>
        </button>
      )}
    </div>
  );
}
