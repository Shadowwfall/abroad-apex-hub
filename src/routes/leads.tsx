import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, Globe2, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { leads } from "@/data/crm";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Lead Pool — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Assign, convert or reject incoming study-abroad enquiries from the APEX lead pool.",
      },
      { property: "og:title", content: "Lead Pool — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Incoming enquiries waiting for counsellor assignment." },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Lead Pool"
        description="Website, social and walk-in enquiries awaiting assignment."
        crumbs={["Leads"]}
        actions={
          <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
            Add Lead
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead, i) => (
          <article
            key={lead.id}
            className="surface-card lift animate-rise p-4"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate font-display text-base font-semibold">{lead.name}</h2>
                <p className="text-[11px] text-muted-foreground">{lead.id}</p>
              </div>
              <StatusPill status={lead.priority} />
            </div>

            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Globe2 className="size-3.5 shrink-0" /> {lead.country}
              </p>
              <p className="flex items-center gap-2">
                <Sparkles className="size-3.5 shrink-0" /> {lead.program}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="size-3.5 shrink-0" /> {lead.date}
              </p>
            </div>

            <Badge variant="secondary" className="mt-3 rounded-full text-[10px]">
              Source · {lead.source}
            </Badge>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                className="rounded-xl gradient-warm text-primary-foreground"
                onClick={() => toast.success(`${lead.name} converted to student`)}
              >
                Convert
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                Assign
              </Button>
              <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground">
                Note
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
