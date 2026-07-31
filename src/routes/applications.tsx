import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { students } from "@/data/crm";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Applications — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Track every university application through counselling, offers, visa filing and enrolment.",
      },
      { property: "og:title", content: "Applications — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Kanban pipeline of live student applications." },
    ],
  }),
  component: ApplicationsPage,
});

const stages = ["Counselling", "Applied", "Offer Received", "Visa Filed", "Visa Approved", "Enrolled"] as const;

function ApplicationsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Applications"
        description="Pipeline view of every live application across branches."
        crumbs={["Applications"]}
        actions={
          <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
            New Application
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage, i) => {
          const items = students.filter((s) => s.status === stage);
          return (
            <section
              key={stage}
              className="surface-card animate-rise p-3"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <h2 className="truncate text-sm font-semibold">{stage}</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((s) => (
                  <div
                    key={s.id}
                    className="lift rounded-xl border border-border/70 bg-background/70 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar className="size-8 shrink-0 border border-border">
                        <AvatarFallback className="bg-accent text-[10px] font-semibold text-accent-foreground">
                          {s.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {s.country} · {s.intake}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <StatusPill status={s.status} />
                      <span className="truncate text-[11px] text-muted-foreground">{s.counsellor}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Nothing in this stage
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
