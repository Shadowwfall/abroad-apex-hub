import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Plus, Loader2, Upload, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { RecordPaymentModal } from "@/components/crm/RecordPaymentModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { destinations as allDestinations } from "@/data/checklists";
import { money } from "@/data/crm";
import { getStudent, type FullStudentDetail } from "@/lib/api/students";
import { addDestination, updateChecklistItemStatus } from "@/lib/api/destinations";
import { createDocumentRecord, reviewDocument, getDocumentDownloadUrl } from "@/lib/api/documents";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/students/$id")({
  loader: async ({ params }) => {
    const student = await getStudent({ data: params.id });
    if (!student) throw notFound();
    return { initialStudent: student, studentId: params.id };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.initialStudent) {
      return {
        meta: [
          { title: "Student not found — APEX Abroad CRM" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.initialStudent.name} — Student File | APEX Abroad CRM`;
    const description = `Profile, documents, destinations, checklists, payments and visa status for ${loaderData.initialStudent.name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: StudentDetailPage,
  notFoundComponent: StudentNotFound,
});

function StudentNotFound() {
  return (
    <div className="mx-auto max-w-[700px] p-12 text-center">
      <h1 className="font-display text-2xl font-semibold">Student not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This student file does not exist or was archived.
      </p>
      <Button asChild className="mt-5 rounded-xl gradient-warm text-primary-foreground">
        <Link to="/students">Back to students</Link>
      </Button>
    </div>
  );
}

function StudentDetailPage() {
  const { initialStudent, studentId } = Route.useLoaderData();
  const queryClient = useQueryClient();

  const { data: student } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => getStudent({ data: studentId }),
    initialData: initialStudent,
  });

  const [newCountry, setNewCountry] = useState<string>("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const addDestMutation = useMutation({
    mutationFn: (country: string) =>
      addDestination({
        data: {
          studentId: student!.id,
          country,
          intake: student!.preferredIntake,
        },
      }),
    onSuccess: (_, country) => {
      toast.success(`${country} destination added with admission & visa checklists!`);
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      setNewCountry("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add destination");
    },
  });

  const handleAddDestination = () => {
    if (!newCountry) return;
    addDestMutation.mutate(newCountry);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docName.trim()) {
      toast.error("Please provide both document name and file");
      return;
    }

    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const fileExt = selectedFile.name.split(".").pop();
      const storageKey = `${student!.id}/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      // Upload file directly to Supabase storage bucket
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storageKey, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save document metadata in database
      await createDocumentRecord({
        data: {
          studentId: student!.id,
          name: docName.trim(),
          storageKey,
          mime: selectedFile.type,
          sizeBytes: selectedFile.size,
        },
      });

      toast.success(`Document "${docName}" uploaded successfully!`);
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      setUploadOpen(false);
      setDocName("");
      setSelectedFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload document";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDoc = async (storageKey: string, name: string) => {
    try {
      const { url } = await getDocumentDownloadUrl({ data: { storageKey } });
      window.open(url, "_blank");
    } catch {
      toast.error("Could not generate download link for this document");
    }
  };

  if (!student) return <StudentNotFound />;

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalPaid = student.totals.paid;
  const totalDue = student.totals.pending;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={student.name}
        description={`${student.code} · ${student.branchName} · Counsellor ${student.counsellorName}`}
        crumbs={["Students", student.name]}
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to="/students">
                <ArrowLeft className="mr-1 size-4" /> Back
              </Link>
            </Button>
          </>
        }
      />

      <div className="surface-card animate-rise mb-4 flex flex-wrap items-center gap-4 p-4">
        <Avatar className="size-14 border border-border">
          <AvatarFallback className="bg-accent font-display text-base font-semibold text-accent-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold">{student.name}</p>
          <p className="text-xs text-muted-foreground">
            {student.email} · {student.phone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={student.status} />
          {student.destinations.map((d) => (
            <Badge key={d.id} variant="secondary" className="rounded-full text-[11px]">
              <MapPin className="mr-1 size-3" />
              {d.country}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl">
          <TabsTrigger value="details" className="rounded-lg">
            Details
          </TabsTrigger>
          <TabsTrigger value="destinations" className="rounded-lg">
            Destinations & Checklists
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg">
            Documents ({student.uploads.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg">
            Payments ({student.payments.length})
          </TabsTrigger>
          <TabsTrigger value="forms" className="rounded-lg">
            Form filling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Personal information">
              <Facts
                rows={[
                  ["Full name", student.name],
                  ["Student ID", student.code],
                  ["Date of birth", student.dob],
                  ["Gender", student.gender],
                  ["Phone", student.phone],
                  ["Email", student.email],
                  ["Passport", student.passport],
                  ["Address", student.address],
                ]}
              />
            </Panel>
            <Panel title="Academic profile">
              <Facts
                rows={[
                  ["Highest qualification", student.highestQualification],
                  ["Score / CGPA", student.percentage],
                  ["English test", student.englishTest],
                  ["Work experience", student.workExperience],
                  ["Branch", student.branchName],
                  ["Counsellor", student.counsellorName],
                  ["Preferred intake", student.preferredIntake],
                  ["Pipeline status", student.status],
                ]}
              />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="destinations">
          <div className="surface-card mb-4 flex flex-wrap items-end gap-3 p-4">
            <div className="min-w-[220px] flex-1">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Add another destination
              </p>
              <Select value={newCountry} onValueChange={(v) => setNewCountry(v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {allDestinations.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddDestination}
              disabled={!newCountry || addDestMutation.isPending}
              className="rounded-xl gradient-warm text-primary-foreground"
            >
              {addDestMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-1 size-4" /> Add destination
                </>
              )}
            </Button>
          </div>

          {student.destinations.length === 0 && (
            <div className="surface-card p-10 text-center">
              <p className="font-display text-lg font-semibold">No destinations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a destination to generate its admission and visa checklists.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {student.destinations.map((d) => (
              <DestinationCard key={d.id} dest={d} studentId={studentId} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 flex-1">
              {["Approved", "Received", "Pending", "Rejected"].map((s) => (
                <div key={s} className="surface-card p-4">
                  <p className="text-xs text-muted-foreground">
                    {s === "Received" ? "Submitted (in review)" : s}
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold">
                    {student.uploads.filter((u) => u.status === s).length}
                  </p>
                </div>
              ))}
            </div>

            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
                  <Upload className="mr-1.5 size-4" /> Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl">
                <form onSubmit={handleFileUpload}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="size-5 text-primary" /> Upload Student Document
                    </DialogTitle>
                    <DialogDescription>
                      Upload files directly to the secure Supabase storage bucket.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-3 py-4">
                    <div className="space-y-1">
                      <Label htmlFor="docname">Document Name *</Label>
                      <Input
                        id="docname"
                        placeholder="e.g. Passport Copy / IELTS Test Score"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="docfile">Select File *</Label>
                      <Input
                        id="docfile"
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadOpen(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="gradient-warm text-primary-foreground"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        "Upload to Cloud"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Document</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Remark</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.uploads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No documents uploaded yet. Click Upload Document to add files.
                      </TableCell>
                    </TableRow>
                  ) : (
                    student.uploads.map((u) => (
                      <TableRow key={u.id} className="transition-colors hover:bg-accent/40">
                        <TableCell className="text-sm font-medium">{u.name}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {u.uploaded}
                        </TableCell>
                        <TableCell>
                          <ReviewDropdown
                            docId={u.id}
                            currentStatus={u.status}
                            studentId={studentId}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {u.reviewer}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.remark ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => handleDownloadDoc(u.storageKey, u.name)}
                          >
                            <ExternalLink className="mr-1 size-3.5" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 flex-1">
              <div className="surface-card p-4">
                <p className="text-xs text-muted-foreground">Amount paid</p>
                <p className="mt-2 font-display text-2xl font-semibold text-success">
                  {money(totalPaid, "INR")}
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-xs text-muted-foreground">Amount pending</p>
                <p className="mt-2 font-display text-2xl font-semibold text-destructive">
                  {money(totalDue, "INR")}
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-xs text-muted-foreground">Payment status</p>
                <div className="mt-3">
                  <StatusPill
                    status={totalDue > 0 ? (totalPaid > 0 ? "Partial" : "Pending") : "Paid"}
                  />
                </div>
              </div>
            </div>

            <RecordPaymentModal defaultStudentId={student.id} />
          </div>

          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Receipt</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.payments.map((p) => (
                    <TableRow key={p.id} className="transition-colors hover:bg-accent/40">
                      <TableCell className="whitespace-nowrap text-sm font-medium">
                        {p.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{p.type}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {p.mode}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {p.date}
                      </TableCell>
                      <TableCell>
                        <StatusPill status={p.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm font-semibold">
                        {money(p.paid, p.currency)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm">
                        {money(Math.max(0, p.amount - p.paid), p.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {student.payments.length === 0 && (
              <p className="p-10 text-center text-sm text-muted-foreground">
                No payment records yet. Click Record payment to issue a receipt.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="forms">
          <div className="surface-card divide-y divide-border/70">
            {student.forms.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No active forms for this student.
              </p>
            ) : (
              student.forms.map((f) => (
                <div key={f.id} className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-[200px] flex-1">
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-[11px] text-muted-foreground">Owner · {f.owner}</p>
                  </div>
                  <div className="w-40">
                    <Progress value={f.progress} className="h-2" />
                    <p className="mt-1 text-[11px] text-muted-foreground">{f.progress}% complete</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full text-[11px]">
                    {f.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReviewDropdown({
  docId,
  currentStatus,
  studentId,
}: {
  docId: string;
  currentStatus: string;
  studentId: string;
}) {
  const queryClient = useQueryClient();
  const reviewMutation = useMutation({
    mutationFn: (status: "Approved" | "Rejected" | "Received" | "Waived") =>
      reviewDocument({ data: { docId, status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      toast.success("Document status updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update review"),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer">
          <StatusPill status={currentStatus} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        {(["Received", "Approved", "Rejected", "Waived"] as const).map((st) => (
          <DropdownMenuItem
            key={st}
            className="cursor-pointer"
            onClick={() => reviewMutation.mutate(st)}
          >
            <StatusPill status={st} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DestinationCard({
  dest,
  studentId,
}: {
  dest: FullStudentDetail["destinations"][number];
  studentId: string;
}) {
  return (
    <div className="surface-card animate-rise overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <h3 className="font-display text-lg font-semibold">{dest.country}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {dest.university} · {dest.course} · {dest.intake}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={dest.applicationStatus} />
          <Badge variant="outline" className="rounded-full text-[11px]">
            Visa · {dest.visaStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <ChecklistColumn
          title="University / Admission Checklist"
          subtitle={`${dest.university} — ${dest.course}`}
          items={dest.admissionItems}
          studentId={studentId}
        />
        <div className="border-t border-border/70 lg:border-l lg:border-t-0">
          <ChecklistColumn
            title="Visa Checklist"
            subtitle={`${dest.country} Student Visa Route`}
            items={dest.visaItems}
            studentId={studentId}
          />
        </div>
      </div>
    </div>
  );
}

function ChecklistColumn({
  title,
  subtitle,
  items,
  studentId,
}: {
  title: string;
  subtitle: string;
  items: Array<{
    id: string;
    label: string;
    note?: string | null;
    optional: boolean;
    status: string;
  }>;
  studentId: string;
}) {
  const queryClient = useQueryClient();
  const done = items.filter((i) => i.status === "Approved" || i.status === "Waived").length;

  const updateMutation = useMutation({
    mutationFn: (args: { itemId: string; status: any }) =>
      updateChecklistItemStatus({
        data: args,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      toast.success("Checklist item updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update item");
    },
  });

  return (
    <div className="p-4">
      <div className="mb-3">
        <h4 className="font-display text-sm font-semibold">{title}</h4>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={(done / Math.max(items.length, 1)) * 100} className="h-1.5 flex-1" />
          <span className="text-[11px] text-muted-foreground">
            {done}/{items.length}
          </span>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((i) => (
          <li
            key={i.id}
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border/70 bg-background/60 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {i.label}
                {i.optional && (
                  <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                    optional
                  </span>
                )}
              </p>
              {i.note && <p className="mt-0.5 text-[11px] text-muted-foreground">{i.note}</p>}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <StatusPill status={i.status} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {(["Pending", "Received", "Approved", "Rejected", "Waived"] as const).map((st) => (
                  <DropdownMenuItem
                    key={st}
                    className="cursor-pointer"
                    onClick={() => updateMutation.mutate({ itemId: i.id, status: st })}
                  >
                    <StatusPill status={st} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card animate-rise p-4">
      <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-xl border border-border/70 bg-background/60 p-3">
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt>
          <dd className="mt-1 text-sm font-medium break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
