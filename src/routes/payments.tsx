import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { TableToolbar } from "@/components/crm/TableToolbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money, students } from "@/data/crm";
import { getStudentProfile } from "@/data/student-detail";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Student-wise payment records: amount paid, amount pending and payment status per student file.",
      },
      { property: "og:title", content: "Payments — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Student-wise fee records for APEX Abroad staff." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    return students
      .map((s) => {
        const profile = getStudentProfile(s.id, s.name, s.country, s.intake);
        const paid = profile.payments.reduce((a, p) => a + p.paid, 0);
        const pending = profile.payments.length
          ? profile.payments.reduce((a, p) => a + (p.amount - p.paid), 0)
          : s.outstanding;
        return {
          student: s,
          paid,
          pending,
          status: pending > 0 ? (paid > 0 ? "Partial" : "Pending") : "Paid",
        };
      })
      .filter((r) =>
        [r.student.name, r.student.id, r.student.branch, r.student.counsellor]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase()),
      );
  }, [q]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Payments"
        description="Student-wise payment records. Open a student to view their full payment history."
        crumbs={["Payments"]}
        actions={
          <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
            Record payment
          </Button>
        }
      />

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar value={q} onChange={setQ} placeholder="Search by student name, ID or branch…" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Student</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Counsellor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.student.id} className="transition-colors hover:bg-accent/40">
                  <TableCell>
                    <Link
                      to="/students/$id"
                      params={{ id: r.student.id }}
                      className="group flex min-w-0 items-center gap-3"
                    >
                      <Avatar className="size-9 shrink-0 border border-border">
                        <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
                          {r.student.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                          {r.student.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{r.student.id}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {r.student.branch}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {r.student.counsellor}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={r.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-sm font-semibold text-success">
                    {money(r.paid, "INR")}
                  </TableCell>
                  <TableCell
                    className={`whitespace-nowrap text-right text-sm font-medium ${
                      r.pending > 0 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {money(r.pending, "INR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="rounded-lg">
                      <Link to="/students/$id" params={{ id: r.student.id }}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {rows.length === 0 && (
          <p className="p-12 text-center text-sm text-muted-foreground">No matching students.</p>
        )}
      </div>
    </div>
  );
}
