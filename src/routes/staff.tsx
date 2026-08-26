import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
import { listStaff, updateStaffStatus } from "@/lib/api/staff";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content:
          "Create staff, assign roles and manage multi-branch access for the APEX Abroad team.",
      },
      { property: "og:title", content: "Staff — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Role-based staff and branch assignment management." },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["staff", { q }],
    queryFn: () => listStaff({ data: { q } }),
  });

  const statusMutation = useMutation({
    mutationFn: (args: { staffId: string; active: boolean }) => updateStaffStatus({ data: args }),
    onSuccess: (updated) => {
      toast.success(`Staff member ${updated.name} ${updated.active ? "activated" : "deactivated"}`);
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update staff status");
    },
  });

  const rows = staffList.filter((s) =>
    [s.name, s.email, s.role, s.branches.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Staff"
        description="Roles, permissions and multi-branch assignment."
        crumbs={["Administration", "Staff"]}
        actions={
          <Button
            size="sm"
            className="rounded-xl gradient-warm text-primary-foreground"
            onClick={() =>
              toast.info("Staff members can register via the portal login page with their email.")
            }
          >
            Add Staff
          </Button>
        }
      />

      <div className="surface-card animate-rise overflow-hidden">
        <TableToolbar
          value={q}
          onChange={setQ}
          placeholder="Search staff by name, email or role…"
        />
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">Loading staff...</p>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No staff records found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => (
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
                      <Switch
                        checked={s.active}
                        onCheckedChange={(checked) =>
                          statusMutation.mutate({ staffId: s.id, active: checked })
                        }
                      />
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
