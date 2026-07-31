import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { TableToolbar } from "@/components/crm/TableToolbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { staff } from "@/data/crm";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Create staff, assign roles and manage multi-branch access for the APEX Abroad team.",
      },
      { property: "og:title", content: "Staff — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Role-based staff and branch assignment management." },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const [q, setQ] = useState("");
  const rows = useMemo(
    () =>
      staff.filter((s) =>
        [s.name, s.email, s.role, s.branches.join(" ")].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Staff"
        description="Roles, permissions and multi-branch assignment."
        crumbs={["Administration", "Staff"]}
        actions={
          <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
            Add Staff
          </Button>
        }
      />

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar value={q} onChange={setQ} placeholder="Search staff by name, email or role…" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branches</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id} className="transition-colors hover:bg-accent/40">
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-9 shrink-0 border border-border">
                        <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
                          {s.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusPill status={s.role} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.branches.map((b) => (
                        <Badge key={b} variant="secondary" className="rounded-full text-[10px]">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch defaultChecked={s.active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => toast.success(`Password reset link sent to ${s.email}`)}
                    >
                      Reset password
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
