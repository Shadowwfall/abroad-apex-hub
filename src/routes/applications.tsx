import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NewStudentModal } from "@/components/crm/NewStudentModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listApplications, updateApplicationStage } from "@/lib/api/applications";
import { useApp } from "@/lib/context/app-context";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Applications — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content:
          "Track every university application through counselling, offers, visa filing and enrolment.",
      },
      { property: "og:title", content: "Applications — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Kanban pipeline of live student applications." },
    ],
  }),
  component: ApplicationsPage,
});

const stages = [
  "Counselling",
  "Applied",
  "Offer Received",
  "Visa Filed",
  "Visa Approved",
  "Enrolled",
] as const;

function ApplicationsPage() {
  const { activeBranchId } = useApp();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications", { branchId: activeBranchId }],
    queryFn: () => listApplications({ data: { branchId: activeBranchId } }),
  });

  const moveMutation = useMutation({
    mutationFn: (args: { studentId: string; stage: string }) =>
      updateApplicationStage({ data: args }),
    onSuccess: (student, { stage }) => {
      toast.success(`Moved ${student.name} to ${stage}`);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update stage");
    },
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Applications"
        description="Pipeline view of live applications across branches. Click status to move stages."
        crumbs={["Applications"]}
        actions={<NewStudentModal />}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stages.map((stage, i) => {
            const items = applications.filter((a) => a.stage === stage);
            return (
              <section
                key={stage}
                className="surface-card animate-rise p-3"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="mb-3 flex items-center justify-between gap-2 px-1">
                  <h2 className="truncate text-sm font-semibold">{stage}</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground font-medium">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((app) => (
                    <div
                      key={app.id}
                      className="lift rounded-xl border border-border/70 bg-background/70 p-3"
                    >
                      <Link
                        to="/students/$id"
                        params={{ id: app.studentCode }}
                        className="flex min-w-0 items-center gap-2.5 group"
                      >
                        <Avatar className="size-8 shrink-0 border border-border">
                          <AvatarFallback className="bg-accent text-[10px] font-semibold text-accent-foreground">
                            {app.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                            {app.studentName}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {app.country} {app.university ? `· ${app.university}` : ""} · {app.intake}
                          </p>
                        </div>
                      </Link>

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer">
                              <StatusPill status={app.stage} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-40">
                            {stages.map((st) => (
                              <DropdownMenuItem
                                key={st}
                                className="cursor-pointer"
                                onClick={() =>
                                  moveMutation.mutate({
                                    studentId: app.studentId,
                                    stage: st,
                                  })
                                }
                              >
                                {st}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <span className="truncate text-[11px] text-muted-foreground">
                          {app.counsellor}
                        </span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      No applications in this stage
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
