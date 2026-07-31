import { Download, Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TableToolbar({
  value,
  onChange,
  placeholder = "Search…",
  onAdd,
  addLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/70 p-3 sm:p-4">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 rounded-xl bg-background pl-9"
        />
      </div>
      <Button variant="outline" size="sm" className="rounded-xl">
        <Filter className="size-4" /> Filters
      </Button>
      <Button variant="outline" size="sm" className="hidden rounded-xl sm:inline-flex">
        <SlidersHorizontal className="size-4" /> Columns
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl"
        onClick={() => toast.success("Export queued", { description: "CSV will download shortly." })}
      >
        <Download className="size-4" /> Export
      </Button>
      {addLabel && (
        <Button
          size="sm"
          className="rounded-xl gradient-warm text-primary-foreground"
          onClick={onAdd ?? (() => toast.success(`${addLabel} form opened`))}
        >
          <Plus className="size-4" /> {addLabel}
        </Button>
      )}
    </div>
  );
}
