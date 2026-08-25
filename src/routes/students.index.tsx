import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { TableToolbar } from "@/components/crm/TableToolbar";
import { NewStudentModal } from "@/components/crm/NewStudentModal";
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
import { inr } from "@/data/crm";
import { listStudents } from "@/lib/api/students";
import { useApp } from "@/lib/context/app-context";

export const Route = createFileRoute("/students/")({
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
  const [page, setPage] = useState(1);
  const { activeBranchId } = useApp();

  const { data, isLoading } = useQuery({
    queryKey: ["students", { branchId: activeBranchId, q, page }],
    queryFn: () =>
      listStudents({
        data: {
          branchId: activeBranchId,
          q,
          page,
          pageSize: 25,
        },
      }),
  });

  const students = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Students"
        description={`${total} students registered across APEX branches.`}
        crumbs={["Students"]}
        actions={
          <>
            <NewStudentModal />
          </>
        }
      />

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar
          value={q}
          onChange={(val) => {
            setQ(val);
            setPage(1);
          }}
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">Loading student records...</p>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <p className="font-display text-base font-semibold">No students found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try a different search term or click New Student to create a record.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id} className="transition-colors hover:bg-accent/40">
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <Link
                        to="/students/$id"
                        params={{ id: s.code || s.id }}
                        className="flex min-w-0 items-center gap-3 group"
                      >
                        <Avatar className="size-9 shrink-0 border border-border">
                          <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
                            {s.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                            {s.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{s.code}</p>
                        </div>
                      </Link>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 p-3 text-xs text-muted-foreground">
          <span>
            Showing {students.length} of {total} records
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={students.length < 25}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
