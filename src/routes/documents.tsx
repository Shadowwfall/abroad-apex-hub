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
import { documents } from "@/data/crm";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Track admission and visa documents with deadlines, owners, versions and review status.",
      },
      { property: "og:title", content: "Documents — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Central document tracking for every student file." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () =>
      documents.filter((d) =>
        [d.name, d.student, d.checklist, d.status, d.officer].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Documents"
        description="All admission and visa documents in one reviewable queue."
        crumbs={["Documents"]}
        actions={
          <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
            Upload
          </Button>
        }
      />

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar value={q} onChange={setQ} placeholder="Search documents or students…" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Document</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Checklist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((d) => (
                <TableRow key={d.id} className="transition-colors hover:bg-accent/40">
                  <TableCell className="text-sm font-medium">{d.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{d.student}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {d.checklist}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={d.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {d.deadline}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {d.officer}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="rounded-lg">
                      Preview
                    </Button>
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
