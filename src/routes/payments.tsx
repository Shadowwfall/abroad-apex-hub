import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { TableToolbar } from "@/components/crm/TableToolbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money, payments } from "@/data/crm";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Fees, installments, refunds and invoices across currencies for APEX Abroad students.",
      },
      { property: "og:title", content: "Payments — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Finance module for collections, refunds and receipts." },
    ],
  }),
  component: PaymentsPage,
});

const stats = [
  { label: "Collected this month", value: "₹32.9 L", tone: "text-success" },
  { label: "Outstanding", value: "₹18.6 L", tone: "text-destructive" },
  { label: "Refunds processed", value: "₹2.2 L", tone: "text-warning-foreground" },
  { label: "Invoices issued", value: "184", tone: "text-info" },
];

function PaymentsPage() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () =>
      payments.filter((p) =>
        [p.id, p.student, p.type, p.mode, p.status].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Payments"
        description="Multi-currency collections, installments and refunds."
        crumbs={["Payments"]}
        actions={
          <>
            <Button variant="outline" size="sm" className="rounded-xl">
              Record refund
            </Button>
            <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
              Record payment
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="surface-card lift animate-rise p-4" style={{ animationDelay: `${i * 40}ms` }}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`mt-2 font-display text-2xl font-semibold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar value={q} onChange={setQ} placeholder="Search by student, type or receipt no…" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Receipt</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} className="transition-colors hover:bg-accent/40">
                  <TableCell className="whitespace-nowrap text-sm font-medium">{p.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{p.student}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{p.type}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{p.mode}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{p.date}</TableCell>
                  <TableCell>
                    <StatusPill status={p.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-sm font-semibold">
                    {money(p.amount, p.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
