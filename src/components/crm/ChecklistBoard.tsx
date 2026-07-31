import type { ReactNode } from "react";

import { StatusPill } from "@/components/crm/StatusPill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export type ChecklistItem = {
  id: string;
  label: string;
  required: boolean;
  status: "Pending" | "Received" | "Rejected" | "Waived";
  deadline: string;
  owner: string;
};

export type ChecklistSection = {
  title: string;
  items: ChecklistItem[];
};

export function ChecklistBoard({
  sections,
  footer,
}: {
  sections: ChecklistSection[];
  footer?: ReactNode;
}) {
  const all = sections.flatMap((s) => s.items);
  const done = all.filter((i) => i.status === "Received" || i.status === "Waived").length;

  return (
    <div className="space-y-4">
      <div className="surface-card animate-rise p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Completion</p>
            <p className="text-xs text-muted-foreground">
              {done} of {all.length} items cleared
            </p>
          </div>
          <p className="font-display text-2xl font-semibold">
            {Math.round((done / all.length) * 100)}%
          </p>
        </div>
        <Progress value={(done / all.length) * 100} className="mt-3 h-2" />
      </div>

      {sections.map((section, i) => (
        <section
          key={section.title}
          className="surface-card animate-rise overflow-hidden"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/70 p-4">
            <h2 className="font-display text-base font-semibold">{section.title}</h2>
            <span className="text-xs text-muted-foreground">{section.items.length} items</span>
          </div>
          <ul className="divide-y divide-border/70">
            {section.items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 transition-colors hover:bg-accent/30 sm:flex sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.label}
                    {item.required && <span className="ml-1 text-destructive">*</span>}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Due {item.deadline} · {item.owner}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill status={item.status} />
                  <Button variant="outline" size="sm" className="hidden rounded-lg sm:inline-flex">
                    Upload
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {footer}
    </div>
  );
}
