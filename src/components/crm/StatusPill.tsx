import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  success: "bg-success/12 text-success border-success/25",
  info: "bg-info/12 text-info border-info/25",
  warning: "bg-warning/18 text-warning-foreground border-warning/35",
  pending: "bg-primary/12 text-primary border-primary/25",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  muted: "bg-muted text-muted-foreground border-border",
};

const map: Record<string, keyof typeof tones> = {
  Paid: "success",
  Received: "success",
  "Visa Approved": "success",
  Enrolled: "success",
  Active: "success",
  Approved: "success",
  Pending: "pending",
  Partial: "pending",
  "Visa Filed": "pending",
  Applied: "info",
  "Offer Received": "info",
  Counselling: "info",
  Lead: "info",
  Waived: "muted",
  Refunded: "warning",
  Rejected: "danger",
  Overdue: "danger",
  Inactive: "muted",
  Archived: "muted",
  High: "danger",
  Medium: "warning",
  Low: "muted",
  "Super Admin": "danger",
  "Branch Admin": "pending",
  Counsellor: "info",
  "Documentation Officer": "warning",
  Finance: "success",
  "Visa Team": "muted",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const tone = tones[map[status] ?? "muted"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
