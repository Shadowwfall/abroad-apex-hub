import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarDays,
  Globe2,
  Sparkles,
  Plus,
  Loader2,
  UserCheck,
  MessageSquare,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listLeads, createLead, convertLeadToStudent, addLeadNote } from "@/lib/api/leads";
import { listCounsellors } from "@/lib/api/staff";
import { useApp } from "@/lib/context/app-context";
import { destinations } from "@/data/checklists";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Lead Pool — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content:
          "Assign, convert or reject incoming study-abroad enquiries from the APEX lead pool.",
      },
      { property: "og:title", content: "Lead Pool — APEX Abroad Consultancy CRM" },
      {
        property: "og:description",
        content: "Incoming enquiries waiting for counsellor assignment.",
      },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { activeBranchId, user } = useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [addOpen, setAddOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<any>(null);
  const [noteBody, setNoteBody] = useState("");
  const [selectedCounsellor, setSelectedCounsellor] = useState("");
  const [convertIntake, setConvertIntake] = useState("Sep 2026");

  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "United Kingdom",
    program: "",
    source: "Website",
    priority: "Medium" as "High" | "Medium" | "Low",
  });

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", { branchId: activeBranchId }],
    queryFn: () => listLeads({ data: { branchId: activeBranchId, status: "new" } }),
  });

  const { data: counsellors = [] } = useQuery({
    queryKey: ["counsellors", { branchId: activeBranchId }],
    queryFn: () => listCounsellors({ data: { branchId: activeBranchId } }),
    enabled: convertOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof leadForm) =>
      createLead({
        data: {
          ...data,
          branchId: activeBranchId !== "all" ? activeBranchId : user?.branches[0]?.id || undefined!,
        },
      }),
    onSuccess: (lead) => {
      toast.success(`Lead created for ${lead.name} (${lead.code})`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setAddOpen(false);
      setLeadForm({
        name: "",
        email: "",
        phone: "",
        country: "United Kingdom",
        program: "",
        source: "Website",
        priority: "Medium",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create lead");
    },
  });

  const convertMutation = useMutation({
    mutationFn: ({ leadId, counsellorId, intake }: { leadId: string; counsellorId: string; intake: string }) => {
      const branchToUse = activeBranchId !== "all" ? activeBranchId : user?.branches[0]?.id || "";
      return convertLeadToStudent({
        data: {
          leadId,
          branchId: branchToUse,
          counsellorId,
          intake,
        },
      });
    },
    onSuccess: ({ student }) => {
      toast.success(`${student.name} converted to student file (${student.code})!`, {
        action: {
          label: "View File",
          onClick: () => navigate({ to: "/students/$id", params: { id: student.code } }),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      setConvertOpen(false);
      setSelectedCounsellor("");
      setConvertIntake("Sep 2026");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to convert lead");
    },
  });

  const noteMutation = useMutation({
    mutationFn: () => addLeadNote({ data: { leadId: activeLead.id, body: noteBody } }),
    onSuccess: () => {
      toast.success("Note attached to lead");
      setNoteOpen(false);
      setNoteBody("");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add note"),
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Lead Pool"
        description="Website, social and walk-in enquiries awaiting counsellor assignment."
        crumbs={["Leads"]}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
                <Plus className="mr-1.5 size-4" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!leadForm.name) {
                    toast.error("Name is required");
                    return;
                  }
                  createMutation.mutate(leadForm);
                }}
              >
                <DialogHeader>
                  <DialogTitle>Capture New Lead</DialogTitle>
                  <DialogDescription>
                    Record an incoming prospective student enquiry.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="lname">Full Name *</Label>
                    <Input
                      id="lname"
                      placeholder="e.g. Harsha Vardhan"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="lemail">Email</Label>
                      <Input
                        id="lemail"
                        type="email"
                        placeholder="email@example.com"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="lphone">Phone</Label>
                      <Input
                        id="lphone"
                        placeholder="+91..."
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label>Target Country</Label>
                      <Select
                        value={leadForm.country}
                        onValueChange={(val) => setLeadForm({ ...leadForm, country: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Priority</Label>
                      <Select
                        value={leadForm.priority}
                        onValueChange={(val: any) => setLeadForm({ ...leadForm, priority: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lprog">Program / Course Interest</Label>
                    <Input
                      id="lprog"
                      placeholder="e.g. MS Data Science"
                      value={leadForm.program}
                      onChange={(e) => setLeadForm({ ...leadForm, program: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Source</Label>
                    <Select
                      value={leadForm.source}
                      onValueChange={(val) => setLeadForm({ ...leadForm, source: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Google Ads">Google Ads</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-warm text-primary-foreground"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Lead"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <p className="font-display text-lg font-semibold">No active leads in pool</p>
          <p className="mt-1 text-sm text-muted-foreground">
            All leads have been converted or assigned. Click Add Lead to register new walk-ins.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead, i) => (
            <article
              key={lead.id}
              className="surface-card lift animate-rise p-4"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-semibold">{lead.name}</h2>
                  <p className="text-[11px] text-muted-foreground">{lead.code}</p>
                </div>
                <StatusPill status={lead.priority} />
              </div>

              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Globe2 className="size-3.5 shrink-0" /> {lead.country}
                </p>
                <p className="flex items-center gap-2">
                  <Sparkles className="size-3.5 shrink-0" /> {lead.program}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-3.5 shrink-0" /> {lead.date}
                </p>
              </div>

              <Badge variant="secondary" className="mt-3 rounded-full text-[10px]">
                Source · {lead.source}
              </Badge>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-xl gradient-warm text-primary-foreground"
                  onClick={() => {
                    setActiveLead(lead);
                    setConvertOpen(true);
                  }}
                >
                  <UserCheck className="mr-1.5 size-3.5" /> Convert
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl text-muted-foreground"
                  onClick={() => {
                    setActiveLead(lead);
                    setNoteOpen(true);
                  }}
                >
                  <MessageSquare className="mr-1 size-3.5" /> Note
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (noteBody.trim()) noteMutation.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Add Note for {activeLead?.name}</DialogTitle>
              <DialogDescription>
                Attach counsellor remarks or call history to this lead.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Discussed Canada SDS intake..."
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNoteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-warm text-primary-foreground"
                disabled={noteMutation.isPending}
              >
                {noteMutation.isPending ? "Saving..." : "Save Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Convert Lead → Student Dialog */}
      <Dialog open={convertOpen} onOpenChange={(open) => {
        setConvertOpen(open);
        if (!open) {
          setSelectedCounsellor("");
          setConvertIntake("Sep 2026");
        }
      }}>
        <DialogContent className="max-w-md rounded-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCounsellor) {
                toast.error("Please select a counsellor to proceed");
                return;
              }
              if (!activeLead) return;
              convertMutation.mutate({
                leadId: activeLead.id,
                counsellorId: selectedCounsellor,
                intake: convertIntake,
              });
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Users className="size-5 text-primary" /> Assign Counsellor
              </DialogTitle>
              <DialogDescription>
                Select a counsellor to assign to <span className="font-semibold text-foreground">{activeLead?.name}</span> before converting to a student file.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label>Counsellor *</Label>
                <Select
                  value={selectedCounsellor}
                  onValueChange={setSelectedCounsellor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a counsellor…" />
                  </SelectTrigger>
                  <SelectContent>
                    {counsellors.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    {counsellors.length === 0 && (
                      <SelectItem value="__none" disabled>
                        No counsellors found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="convert-intake">Preferred Intake</Label>
                <Input
                  id="convert-intake"
                  placeholder="e.g. Sep 2026"
                  value={convertIntake}
                  onChange={(e) => setConvertIntake(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setConvertOpen(false)}
                disabled={convertMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-warm text-primary-foreground"
                disabled={convertMutation.isPending || !selectedCounsellor}
              >
                {convertMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Converting...
                  </>
                ) : (
                  "Convert to Student"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
