import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { TableToolbar } from "@/components/crm/TableToolbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inr, students } from "@/data/crm";

export const Route = createFileRoute("/students")({
  head: () => ({
    meta: [
      { title: "Students — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content:
          "Search, filter and manage every APEX Abroad student across branches, countries and intakes.",
      },
      { property: "og:title", content: "Students — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Global student management for APEX Abroad staff." },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () =>
      students.filter((s) =>
        [s.name, s.id, s.country, s.branch, s.counsellor, s.status]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [q],
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Students"
        description="1,294 students across 4 active branches."
        crumbs={["Students"]}
        actions={
          <>
            <Button variant="outline" size="sm" className="rounded-xl">
              Import
            </Button>
            <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
              New Student
            </Button>
          </>
        }
      />

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar
          value={q}
          onChange={setQ}
          placeholder="Search by name, ID, country, counsellor…"
          addLabel="Add"
        />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Intake</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Counsellor</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id} className="transition-colors hover:bg-accent/40">
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9 shrink-0 border border-border">
                        <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
                          {s.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {s.branch}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{s.country}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{s.intake}</TableCell>
                  <TableCell>
                    <StatusPill status={s.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {s.counsellor}
                  </TableCell>
                  <TableCell
                    className={`whitespace-nowrap text-right text-sm font-medium ${
                      s.outstanding > 0 ? "text-destructive" : "text-success"
                    }`}
                  >
                    {s.outstanding > 0 ? inr(s.outstanding) : "Settled"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {rows.length === 0 && (
          <div className="p-12 text-center">
            <p className="font-display text-lg font-semibold">No students found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term or clear your filters.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 p-3 text-xs text-muted-foreground">
          <span>Showing {rows.length} of {students.length} records</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
