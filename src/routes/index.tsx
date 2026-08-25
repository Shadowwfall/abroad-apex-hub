import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  UserPlus,
  Loader2,
} from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { StatusPill } from "@/components/crm/StatusPill";
import { NewStudentModal } from "@/components/crm/NewStudentModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { monthlyAdmissions, deadlines } from "@/data/crm";
import {
  getDashboardKpis,
  getCountryDistribution,
  getDashboardTasks,
  toggleTaskDone,
} from "@/lib/api/dashboard";
import { listActivities } from "@/lib/api/activity";
import { listLeads } from "@/lib/api/leads";
import { useApp } from "@/lib/context/app-context";

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
        content:
          "Live overview of students, applications, deadlines and visa success across APEX Abroad branches.",
      },
    ],
  }),
  component: Dashboard,
});

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
  const { user, activeBranchId } = useApp();
  const queryClient = useQueryClient();

  const { data: kpis } = useQuery({
    queryKey: ["dashboard-kpis", { branchId: activeBranchId }],
    queryFn: () => getDashboardKpis({ data: { branchId: activeBranchId } }),
  });

  const { data: countryDist = [] } = useQuery({
    queryKey: ["country-distribution", { branchId: activeBranchId }],
    queryFn: () => getCountryDistribution({ data: { branchId: activeBranchId } }),
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["activities", { branchId: activeBranchId, limit: 5 }],
    queryFn: () => listActivities({ data: { branchId: activeBranchId, limit: 5 } }),
  });

  const { data: recentLeads = [] } = useQuery({
    queryKey: ["leads", { branchId: activeBranchId }],
    queryFn: () => listLeads({ data: { branchId: activeBranchId, status: "new" } }),
  });

  const { data: tasksList = [] } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: () => getDashboardTasks(),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: (args: { id: string; done: boolean }) => toggleTaskDone({ data: args }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-tasks"] }),
  });

  const kpiCards = [
    {
      label: "Total Students",
      value: kpis?.totalStudents?.toString() || "0",
      delta: "Active records",
      icon: GraduationCap,
      tone: "text-primary",
    },
    {
      label: "Active Applications",
      value: kpis?.activeApplications?.toString() || "0",
      delta: "In progress",
      icon: FileText,
      tone: "text-info",
    },
    {
      label: "Pending Documents",
      value: kpis?.pendingDocuments?.toString() || "0",
      delta: "Require review",
      icon: FileClock,
      tone: "text-warning-foreground",
    },
    {
      label: "Upcoming Deadlines",
      value: kpis?.upcomingDeadlines?.toString() || "0",
      delta: "Next 14 days",
      icon: CalendarClock,
      tone: "text-destructive",
    },
    {
      label: "Visa Success Rate",
      value: kpis?.visaSuccessRate || "94.2%",
      delta: "Approved files",
      icon: Plane,
      tone: "text-success",
    },
    {
      label: "Admission Success",
      value: kpis?.admissionSuccessRate || "88.7%",
      delta: "Offer conversion",
      icon: CheckCircle2,
      tone: "text-info",
    },
  ];

  const firstName = user?.name ? user.name.split(" ")[0] : "Staff";

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here's how APEX Abroad is performing across branches today."
        crumbs={["Dashboard"]}
        actions={<NewStudentModal />}
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi, i) => (
          <div
            key={kpi.label}
            className="surface-card lift animate-rise p-4"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-lg bg-accent ${kpi.tone}`}
              >
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
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                  width={32}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="var(--color-chart-2)"
                  fill="url(#gApp)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="admissions"
                  stroke="var(--color-chart-1)"
                  fill="url(#gAdm)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Country distribution</h2>
          <p className="text-xs text-muted-foreground">Share of destinations</p>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryDist}
                  dataKey="value"
                  nameKey="country"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {countryDist.map((entry, i) => (
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
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent audit logs.</p>
            ) : (
              recentActivity.slice(0, 5).map((a) => (
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
              ))
            )}
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
                <StatusPill
                  status={d.bucket === "Overdue" ? "Overdue" : d.bucket === "Today" ? "Pending" : "Low"}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Today's tasks</h2>
          <ul className="mt-4 space-y-3">
            {tasksList.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <Checkbox
                  checked={t.done}
                  onCheckedChange={(checked) =>
                    toggleTaskMutation.mutate({ id: t.id, done: Boolean(checked) })
                  }
                  className="mt-0.5"
                />
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
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Latest leads</h2>
            <Link to="/leads" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recentLeads.slice(0, 4).map((l) => (
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
            {recentLeads.length === 0 && (
              <p className="text-xs text-muted-foreground">No new leads waiting in pool.</p>
            )}
          </ul>
        </div>

        <div className="surface-card p-4">
          <h2 className="font-display text-lg font-semibold">Quick navigation</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/students">
              <Button variant="outline" className="w-full justify-start rounded-xl py-3 text-xs">
                Students
              </Button>
            </Link>
            <Link to="/leads">
              <Button variant="outline" className="w-full justify-start rounded-xl py-3 text-xs">
                Lead Pool
              </Button>
            </Link>
            <Link to="/applications">
              <Button variant="outline" className="w-full justify-start rounded-xl py-3 text-xs">
                Applications
              </Button>
            </Link>
            <Link to="/payments">
              <Button variant="outline" className="w-full justify-start rounded-xl py-3 text-xs">
                Payments
              </Button>
            </Link>
            <Link to="/staff">
              <Button variant="outline" className="w-full justify-start rounded-xl py-3 text-xs">
                Staff
              </Button>
            </Link>
            <Link to="/branches">
              <Button variant="outline" className="w-full justify-start rounded-xl py-3 text-xs">
                Branches
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
