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
import { createStudent } from "@/lib/api/students";
import { useApp } from "@/lib/context/app-context";
import { destinations } from "@/data/checklists";

export function NewStudentModal({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user } = useApp();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "United Kingdom",
    preferredIntake: "Sep 2026",
    branchId: "",
    qualification: "",
    score: "",
    englishTest: "",
  });

  const branches = user?.branches || [];

  const mutation = useMutation({
    mutationFn: (data: typeof formData) =>
      createStudent({
        data: {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          country: data.country || undefined,
          preferredIntake: data.preferredIntake || undefined,
          branchId: data.branchId || branches[0]?.id || "",
          qualification: data.qualification || undefined,
          score: data.score || undefined,
          englishTest: data.englishTest || undefined,
        },
      }),
    onSuccess: (student) => {
      toast.success(`Student ${student.name} created (${student.code})!`);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        country: "United Kingdom",
        preferredIntake: "Sep 2026",
        branchId: "",
        qualification: "",
        score: "",
        englishTest: "",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create student");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Student name is required");
      return;
    }
    const branchToUse = formData.branchId || branches[0]?.id;
    if (!branchToUse) {
      toast.error("Please select a branch");
      return;
    }

    mutation.mutate({
      ...formData,
      branchId: branchToUse,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
            <Plus className="mr-1.5 size-4" /> New Student
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="size-5 text-primary" /> Create New Student File
            </DialogTitle>
            <DialogDescription>
              Add a new student to the APEX Abroad CRM. An initial destination and checklist will be
              automatically generated.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Student Full Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Sneha Reddy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="sneha@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Branch *</Label>
              <Select
                value={formData.branchId || branches[0]?.id}
                onValueChange={(val) => setFormData({ ...formData, branchId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Preferred Country</Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="intake">Intake</Label>
              <Input
                id="intake"
                placeholder="e.g. Sep 2026"
                value={formData.preferredIntake}
                onChange={(e) => setFormData({ ...formData, preferredIntake: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qual">Highest Qualification</Label>
              <Input
                id="qual"
                placeholder="e.g. B.Tech CSE"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />
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
                  <Loader2 className="mr-2 size-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
