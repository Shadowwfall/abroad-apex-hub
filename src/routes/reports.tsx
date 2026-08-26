import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/crm/PageHeader";
import { Button } from "@/components/ui/button";
import { branches, monthlyAdmissions } from "@/data/crm";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content:
          "Branch performance, conversion and admissions reporting for APEX Abroad Consultancy.",
      },
      { property: "og:title", content: "Reports — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Exportable insight across branches and intakes." },
    ],
  }),
  component: ReportsPage,
});

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  fontSize: 12,
};

function ReportsPage() {
  const branchData = branches.map((b) => ({ name: b.name.split(" ")[0], students: b.students }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Reports"
        description="Performance analytics across branches, counsellors and intakes."
        crumbs={["Administration", "Reports"]}
        actions={
          <Button variant="outline" size="sm" className="rounded-xl">
            Export PDF
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="surface-card animate-rise p-4">
          <h2 className="font-display text-lg font-semibold">Branch student volume</h2>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={34}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="students" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card animate-rise p-4">
          <h2 className="font-display text-lg font-semibold">Admissions momentum</h2>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyAdmissions}>
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
                  width={34}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="admissions"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="var(--color-chart-4)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
