import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLead } from "@/lib/api/leads";
import { useApp } from "@/lib/context/app-context";
import { destinations } from "@/data/checklists";

export function NewLeadModal({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;
  const { user, activeBranchId } = useApp();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "United Kingdom",
    program: "",
    source: "Website",
    priority: "Medium" as "High" | "Medium" | "Low",
  });

  const branches = user?.branches || [];

  const mutation = useMutation({
    mutationFn: (data: typeof formData) =>
      createLead({
        data: {
          name: data.name,
          email: data.email || undefined!,
          phone: data.phone || undefined!,
          country: data.country || undefined!,
          program: data.program || undefined!,
          source: data.source || "Website",
          priority: data.priority || "Medium",
          branchId: activeBranchId !== "all" ? activeBranchId : branches[0]?.id || undefined!,
        },
      }),
    onSuccess: (lead) => {
      toast.success(`Lead created for ${lead.name} (${lead.code})!`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      setOpen(false);
      setFormData({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Lead name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!formData.country) {
      toast.error("Target country is required");
      return;
    }
    if (!formData.program.trim()) {
      toast.error("Program / course interest is required");
      return;
    }
    if (!formData.priority) {
      toast.error("Priority is required");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
            <Plus className="mr-1.5 size-4" /> New Lead
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="size-5 text-primary" /> Capture New Lead
            </DialogTitle>
            <DialogDescription>
              Record an incoming prospective student enquiry. The lead will appear in the Lead Pool
              for counsellor assignment and conversion.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <div className="space-y-1">
              <Label htmlFor="lead-name">Full Name *</Label>
              <Input
                id="lead-name"
                placeholder="e.g. Sneha Reddy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="lead-email">Email *</Label>
                <Input
                  id="lead-email"
                  type="email"
                  placeholder="sneha@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lead-phone">Phone *</Label>
                <Input
                  id="lead-phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Target Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(val) => setFormData({ ...formData, country: val })}
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
                <Label>Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(val: any) => setFormData({ ...formData, priority: val })}
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
              <Label htmlFor="lead-program">Program / Course Interest *</Label>
              <Input
                id="lead-program"
                placeholder="e.g. MS Data Science"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Source</Label>
              <Select
                value={formData.source}
                onValueChange={(val) => setFormData({ ...formData, source: val })}
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
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-warm text-primary-foreground font-medium"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
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
  );
}
