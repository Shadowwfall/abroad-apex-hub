import { createFileRoute } from "@tanstack/react-router";
import { Building2, FileText, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { Button } from "@/components/ui/button";
import { branches, inr } from "@/data/crm";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "Branches — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Create, rename and archive APEX Abroad branches and compare their performance.",
      },
      { property: "og:title", content: "Branches — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Global branch control for super admins." },
    ],
  }),
  component: BranchesPage,
});

function BranchesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Branches"
        description="Global branch management across Telangana."
        crumbs={["Administration", "Branches"]}
        actions={
          <Button
            size="sm"
            className="rounded-xl gradient-warm text-primary-foreground"
            onClick={() => toast.success("Create branch form opened")}
          >
            Create Branch
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {branches.map((b, i) => (
          <article
            key={b.id}
            className="surface-card lift animate-rise p-5"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl gradient-warm text-primary-foreground">
                  <Building2 className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-semibold">{b.name}</h2>
                  <p className="text-[11px] text-muted-foreground">{b.city}</p>
                </div>
              </div>
              <StatusPill status={b.status === "active" ? "Active" : "Archived"} />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/60 p-3">
                <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users className="size-3" /> Students
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold">{b.students}</dd>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users className="size-3" /> Staff
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold">{b.staff}</dd>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <FileText className="size-3" /> Applications
                </dt>
                <dd className="mt-1 font-display text-lg font-semibold">{b.applications}</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl">
                Edit
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                Rename
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-muted-foreground"
                onClick={() => toast(`${b.name} archived`)}
              >
                Archive
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
