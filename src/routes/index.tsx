import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  FileClock,
  FileText,
  GraduationCap,
  Plane,
  TrendingUp,
} from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  activities,
  countryDistribution,
  deadlines,
  leads,
  monthlyAdmissions,
  tasks,
} from "@/data/crm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content:
          "Live overview of students, applications, deadlines and visa success across APEX Abroad branches.",
      },
      { property: "og:title", content: "Dashboard — APEX Abroad Consultancy CRM" },
      {
        property: "og:description",
        content: "Live overview of students, applications, deadlines and visa success across APEX Abroad branches.",
      },
    ],
  }),
  component: Dashboard,
});

const kpis = [
  { label: "Total Students", value: "1,294", delta: "+8.2%", icon: GraduationCap, tone: "text-primary" },
  { label: "Active Applications", value: "575", delta: "+4.1%", icon: FileText, tone: "text-info" },
  { label: "Pending Documents", value: "138", delta: "-6.0%", icon: FileClock, tone: "text-warning-foreground" },
  { label: "Upcoming Deadlines", value: "42", delta: "next 14 days", icon: CalendarClock, tone: "text-destructive" },
  { label: "Visa Success Rate", value: "94.2%", delta: "+1.8%", icon: Plane, tone: "text-success" },
  { label: "Admission Success", value: "88.7%", delta: "+2.3%", icon: CheckCircle2, tone: "text-info" },
];

const pieColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  color: "var(--color-card-foreground)",
  fontSize: 12,
  boxShadow: "var(--shadow-soft)",
};

function Dashboard() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Good morning, Anil"
        description="Here's how APEX Abroad is performing across all Hyderabad branches today."
        crumbs={["Dashboard"]}
        actions={
          <>
            <Button variant="outline" size="sm" className="rounded-xl">
              This month
            </Button>
            <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
              New Student
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="surface-card lift animate-rise p-4"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <span className={`grid size-8 shrink-0 place-items-center rounded-lg bg-accent ${kpi.tone}`}>
                <kpi.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight">{kpi.value}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <ArrowUpRight className="size-3 text-success" />
              {kpi.delta}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="surface-card p-4 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold">Monthly admissions</h2>
              <p className="text-xs text-muted-foreground">Applications vs confirmed admissions</p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              <TrendingUp className="mr-1 size-3" /> +18% YoY
            </Badge>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAdmissions}>
                <defs>
                  <linearGradient id="gAdm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" width={32} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="applications" stroke="var(--color-chart-2)" fill="url(#gApp)" strokeWidth={2} />
                <Area type="monotone" dataKey="admissions" stroke="var(--color-chart-1)" fill="url(#gAdm)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Country distribution</h2>
          <p className="text-xs text-muted-foreground">Share of active applications</p>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryDistribution}
                  dataKey="value"
                  nameKey="country"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {countryDistribution.map((entry, i) => (
                    <Cell key={entry.country} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Recent activity</h2>
          <ol className="mt-4 space-y-4">
            {activities.slice(0, 5).map((a) => (
              <li key={a.id} className="flex gap-3">
                <Avatar className="size-8 shrink-0 border border-border">
                  <AvatarFallback className="bg-accent text-[10px] font-semibold text-accent-foreground">
                    {a.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {a.branch} · {a.time}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Upcoming deadlines</h2>
          <ul className="mt-4 space-y-3">
            {deadlines.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/60 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {d.student} · {d.due}
                  </p>
                </div>
                <StatusPill status={d.bucket === "Overdue" ? "Overdue" : d.bucket === "Today" ? "Pending" : "Low"} />
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Today's tasks</h2>
          <ul className="mt-4 space-y-3">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <Checkbox defaultChecked={t.done} className="mt-0.5" />
                <div className="min-w-0">
                  <p className={`text-sm ${t.done ? "text-muted-foreground line-through" : ""}`}>
                    {t.label}
                  </p>
                  <Badge variant="secondary" className="mt-1 rounded-full text-[10px]">
                    {t.tag}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Latest leads</h2>
          <ul className="mt-4 space-y-3">
            {leads.slice(0, 4).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {l.country} · {l.program}
                  </p>
                </div>
                <StatusPill status={l.priority} />
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Quick actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["Add Student", "Add Lead", "Upload Document", "New Application", "Add Staff"].map(
              (a) => (
                <Button key={a} variant="outline" className="h-auto justify-start rounded-xl py-3 text-xs">
                  {a}
                </Button>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
