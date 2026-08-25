import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { TableToolbar } from "@/components/crm/TableToolbar";
import { RecordPaymentModal } from "@/components/crm/RecordPaymentModal";
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
import { money } from "@/data/crm";
import { listPaymentsSummary } from "@/lib/api/payments";
import { useApp } from "@/lib/context/app-context";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content:
          "Student-wise payment records: amount paid, amount pending and payment status per student file.",
      },
      { property: "og:title", content: "Payments — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Student-wise fee records for APEX Abroad staff." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [q, setQ] = useState("");
  const { activeBranchId } = useApp();

  const { data, isLoading } = useQuery({
    queryKey: ["payments-summary", { branchId: activeBranchId, q }],
    queryFn: () =>
      listPaymentsSummary({
        data: {
          branchId: activeBranchId,
          q,
        },
      }),
  });

  const rows = data?.items || [];
  const total = data?.total || 0;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Payments"
        description="Student-wise payment records. Open a student to view their full payment history."
        crumbs={["Payments"]}
        actions={<RecordPaymentModal />}
      />

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar
          value={q}
          onChange={setQ}
          placeholder="Search by student name, ID or branch…"
        />
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">Loading fee records...</p>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No matching student payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const initials = r.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <TableRow key={r.studentId} className="transition-colors hover:bg-accent/40">
                      <TableCell>
                        <Link
                          to="/students/$id"
                          params={{ id: r.studentCode }}
                          className="group flex min-w-0 items-center gap-3"
                        >
                          <Avatar className="size-9 shrink-0 border border-border">
                            <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                              {r.studentName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{r.studentCode}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {r.branch}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {r.counsellor}
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
                          <Link to="/students/$id" params={{ id: r.studentCode }}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-border/70 p-3 text-xs text-muted-foreground">
          Showing {rows.length} of {total} student records
        </div>
      </div>
    </div>
  );
}
