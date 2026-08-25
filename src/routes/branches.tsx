import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, FileText, Users, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { listBranches, createBranch, updateBranch, archiveBranch } from "@/lib/api/branches";

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
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    city: "Hyderabad",
    address: "",
    phone: "",
  });

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => listBranches(),
  });

  const createMutation = useMutation({
    mutationFn: () => createBranch({ data: form }),
    onSuccess: (b) => {
      toast.success(`Branch ${b.name} created!`);
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setCreateOpen(false);
      setForm({ name: "", city: "Hyderabad", address: "", phone: "" });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to create branch"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateBranch({
        data: {
          id: activeBranch.id,
          name: form.name,
          city: form.city,
          address: form.address,
          phone: form.phone,
        },
      }),
    onSuccess: () => {
      toast.success("Branch details updated");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setEditOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update branch"),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveBranch({ data: { id } }),
    onSuccess: () => {
      toast.success("Branch archived");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to archive branch"),
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Branches"
        description="Global branch control and statistics across Telangana."
        crumbs={["Administration", "Branches"]}
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
                <Plus className="mr-1.5 size-4" /> Create Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.name) return;
                  createMutation.mutate();
                }}
              >
                <DialogHeader>
                  <DialogTitle>Add New Branch</DialogTitle>
                  <DialogDescription>
                    Establish a new APEX Abroad consultancy branch location.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="bname">Branch Name *</Label>
                    <Input
                      id="bname"
                      placeholder="e.g. Somajiguda Center"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bcity">City *</Label>
                    <Input
                      id="bcity"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="baddr">Address</Label>
                    <Input
                      id="baddr"
                      placeholder="Street, Landmark..."
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="bphone">Phone</Label>
                    <Input
                      id="bphone"
                      placeholder="+91 40 2345 6789"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-warm text-primary-foreground"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Branch"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
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

              <dl className="mt-5 grid grid-cols-3 gap-2">
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
                    <FileText className="size-3" /> Apps
                  </dt>
                  <dd className="mt-1 font-display text-lg font-semibold">{b.applications}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    setActiveBranch(b);
                    setForm({
                      name: b.name,
                      city: b.city,
                      address: b.address || "",
                      phone: b.phone || "",
                    });
                    setEditOpen(true);
                  }}
                >
                  Edit
                </Button>
                {b.status === "active" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-muted-foreground"
                    onClick={() => archiveMutation.mutate(b.id)}
                  >
                    Archive
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Edit Branch Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit Branch</DialogTitle>
              <DialogDescription>Update branch information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="space-y-1">
                <Label htmlFor="ebname">Branch Name *</Label>
                <Input
                  id="ebname"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ebcity">City *</Label>
                <Input
                  id="ebcity"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ebaddr">Address</Label>
                <Input
                  id="ebaddr"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ebphone">Phone</Label>
                <Input
                  id="ebphone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-warm text-primary-foreground"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
