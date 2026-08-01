import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Plus } from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countryChecklists, destinations as allDestinations, type Destination } from "@/data/checklists";
import { getStudentProfile, type DocStatus, type StudentDestination } from "@/data/student-detail";
import { money, students } from "@/data/crm";

export const Route = createFileRoute("/students/$id")({
  loader: ({ params }) => {
    const student = students.find((s) => s.id === params.id);
    if (!student) throw notFound();
    return { student };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Student not found — APEX Abroad CRM" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.student.name} — Student File | APEX Abroad CRM`;
    const description = `Profile, documents, destinations, checklists, payments and visa status for ${loaderData.student.name}.`;
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
      <p className="mt-2 text-sm text-muted-foreground">This student file does not exist or was archived.</p>
      <Button asChild className="mt-5 rounded-xl gradient-warm text-primary-foreground">
        <Link to="/students">Back to students</Link>
      </Button>
    </div>
  );
}

const statusTone: Record<DocStatus, string> = {
  Approved: "Approved",
  Received: "Received",
  Pending: "Pending",
  Rejected: "Rejected",
  Waived: "Waived",
};

function StudentDetailPage() {
  const { student } = Route.useLoaderData();
  const base = useMemo(
    () => getStudentProfile(student.id, student.name, student.country, student.intake),
    [student],
  );

  const [dests, setDests] = useState<StudentDestination[]>(base.destinations);
  const [newCountry, setNewCountry] = useState<Destination | "">("");

  const addDestination = () => {
    if (!newCountry) return;
    setDests((d) => [
      ...d,
      {
        id: `${student.id}-${newCountry}-${d.length}`,
        country: newCountry,
        university: "To be shortlisted",
        course: "To be finalised",
        intake: student.intake,
        applicationStatus: "Shortlisting",
        visaStatus: "Not started",
        extraRequirements: [],
        admissionStatus: {},
        visaDocStatus: {},
      },
    ]);
    setNewCountry("");
  };

  const totalPaid = base.payments.reduce((a, p) => a + p.paid, 0);
  const totalDue = base.payments.reduce((a, p) => a + (p.amount - p.paid), 0);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={student.name}
        description={`${student.id} · ${student.branch} · Counsellor ${student.counsellor}`}
        crumbs={["Students", student.name]}
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to="/students">
                <ArrowLeft className="mr-1 size-4" /> Back
              </Link>
            </Button>
            <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
              Edit file
            </Button>
          </>
        }
      />

      <div className="surface-card animate-rise mb-4 flex flex-wrap items-center gap-4 p-4">
        <Avatar className="size-14 border border-border">
          <AvatarFallback className="bg-accent font-display text-base font-semibold text-accent-foreground">
            {student.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold">{student.name}</p>
          <p className="text-xs text-muted-foreground">
            {base.email} · {base.phone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={student.status} />
          {dests.map((d) => (
            <Badge key={d.id} variant="secondary" className="rounded-full text-[11px]">
              <MapPin className="mr-1 size-3" />
              {d.country}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl">
          <TabsTrigger value="details" className="rounded-lg">Details</TabsTrigger>
          <TabsTrigger value="destinations" className="rounded-lg">Destinations & Checklists</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg">Documents</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg">Payments</TabsTrigger>
          <TabsTrigger value="forms" className="rounded-lg">Form filling</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Personal information">
              <Facts
                rows={[
                  ["Full name", student.name],
                  ["Student ID", student.id],
                  ["Date of birth", base.dob],
                  ["Gender", base.gender],
                  ["Phone", base.phone],
                  ["Email", base.email],
                  ["Passport", base.passport],
                  ["Address", base.address],
                ]}
              />
            </Panel>
            <Panel title="Academic profile">
              <Facts
                rows={[
                  ["Highest qualification", base.highestQualification],
                  ["Score", base.percentage],
                  ["English test", base.englishTest],
                  ["Work experience", base.workExperience],
                  ["Branch", student.branch],
                  ["Counsellor", student.counsellor],
                  ["Preferred intake", student.intake],
                  ["Pipeline status", student.status],
                ]}
              />
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="destinations">
          <div className="surface-card mb-4 flex flex-wrap items-end gap-3 p-4">
            <div className="min-w-[220px] flex-1">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Add another destination</p>
              <Select value={newCountry} onValueChange={(v) => setNewCountry(v as Destination)}>
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
            <Button onClick={addDestination} className="rounded-xl gradient-warm text-primary-foreground">
              <Plus className="mr-1 size-4" /> Add destination
            </Button>
          </div>

          {dests.length === 0 && (
            <div className="surface-card p-10 text-center">
              <p className="font-display text-lg font-semibold">No destinations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a destination to generate its admission and visa checklists.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {dests.map((d) => (
              <DestinationCard key={d.id} dest={d} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(["Approved", "Received", "Pending", "Rejected"] as DocStatus[]).map((s) => (
              <div key={s} className="surface-card p-4">
                <p className="text-xs text-muted-foreground">{s === "Received" ? "Submitted (in review)" : s}</p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  {base.uploads.filter((u) => u.status === s).length}
                </p>
              </div>
            ))}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {base.uploads.map((u) => (
                    <TableRow key={u.name} className="transition-colors hover:bg-accent/40">
                      <TableCell className="text-sm font-medium">{u.name}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{u.uploaded}</TableCell>
                      <TableCell>
                        <StatusPill status={statusTone[u.status]} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{u.reviewer}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.remark ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div className="surface-card p-4">
              <p className="text-xs text-muted-foreground">Amount paid</p>
              <p className="mt-2 font-display text-2xl font-semibold text-success">{money(totalPaid, "INR")}</p>
            </div>
            <div className="surface-card p-4">
              <p className="text-xs text-muted-foreground">Amount pending</p>
              <p className="mt-2 font-display text-2xl font-semibold text-destructive">{money(totalDue, "INR")}</p>
            </div>
            <div className="surface-card p-4">
              <p className="text-xs text-muted-foreground">Payment status</p>
              <div className="mt-3">
                <StatusPill status={totalDue > 0 ? "Pending" : "Paid"} />
              </div>
            </div>
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
                  {base.payments.map((p) => (
                    <TableRow key={p.id} className="transition-colors hover:bg-accent/40">
                      <TableCell className="whitespace-nowrap text-sm font-medium">{p.id}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{p.type}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{p.mode}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{p.date}</TableCell>
                      <TableCell>
                        <StatusPill status={p.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm font-semibold">
                        {money(p.paid, p.currency)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm">
                        {money(p.amount - p.paid, p.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {base.payments.length === 0 && (
              <p className="p-10 text-center text-sm text-muted-foreground">No payment records yet.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="forms">
          <div className="surface-card divide-y divide-border/70">
            {base.forms.map((f) => (
              <div key={f.name} className="flex flex-wrap items-center gap-4 p-4">
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
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DestinationCard({ dest }: { dest: StudentDestination }) {
  const pack = countryChecklists[dest.country];
  const admissionItems = [
    ...pack.admission,
    ...dest.extraRequirements.map((label) => ({ label, note: "University / course specific" })),
  ];

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
          items={admissionItems}
          statuses={dest.admissionStatus}
        />
        <div className="border-t border-border/70 lg:border-l lg:border-t-0">
          <ChecklistColumn
            title="Visa Checklist"
            subtitle={pack.visaName}
            items={pack.visa}
            statuses={dest.visaDocStatus}
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
  statuses,
}: {
  title: string;
  subtitle: string;
  items: { label: string; note?: string; optional?: boolean }[];
  statuses: Record<string, DocStatus>;
}) {
  const done = items.filter((i) => {
    const s = statuses[i.label];
    return s === "Approved" || s === "Waived";
  }).length;

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
            key={i.label}
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border/70 bg-background/60 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {i.label}
                {i.optional && (
                  <span className="ml-2 text-[10px] font-normal text-muted-foreground">optional</span>
                )}
              </p>
              {i.note && <p className="mt-0.5 text-[11px] text-muted-foreground">{i.note}</p>}
            </div>
            <StatusPill status={statuses[i.label] ?? "Pending"} />
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
