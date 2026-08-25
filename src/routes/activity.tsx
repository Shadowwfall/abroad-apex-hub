import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { TableToolbar } from "@/components/crm/TableToolbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { listActivities } from "@/lib/api/activity";
import { useApp } from "@/lib/context/app-context";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity Logs — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Global audit trail of who changed what, when and in which APEX Abroad branch.",
      },
      { property: "og:title", content: "Activity Logs — APEX Abroad CRM" },
      { property: "og:description", content: "Searchable, exportable audit timeline." },
    ],
  }),
  component: ActivityPage,
});

const toneRing: Record<string, string> = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  default: "bg-muted-foreground",
};

function ActivityPage() {
  const [q, setQ] = useState("");
  const { activeBranchId } = useApp();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", { branchId: activeBranchId }],
    queryFn: () => listActivities({ data: { branchId: activeBranchId, limit: 50 } }),
  });

  const rows = activities.filter((a) =>
    [a.user, a.action, a.target, a.branch].join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Activity Logs"
        description="Every staff action captured with branch context and timestamps."
        crumbs={["Administration", "Activity Logs"]}
      />

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar value={q} onChange={setQ} placeholder="Search the audit trail…" />
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ol className="relative p-5">
            <span className="absolute left-[38px] top-6 bottom-6 w-px bg-border" aria-hidden />
            {rows.map((a) => (
              <li key={a.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="relative">
                  <Avatar className="size-9 border border-border bg-card">
                    <AvatarFallback className="bg-accent text-[10px] font-semibold text-accent-foreground">
                      {a.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${
                      toneRing[a.tone] ?? "bg-muted-foreground"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      {a.branch}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{a.time}</span>
                  </div>
                </div>
              </li>
            ))}
            {rows.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No matching audit entries found.
              </p>
            )}
          </ol>
        )}
      </div>
    </div>
  );
}
