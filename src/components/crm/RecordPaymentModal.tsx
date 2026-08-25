import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Loader2, Plus } from "lucide-react";
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
import { recordPayment } from "@/lib/api/payments";
import { listStudents } from "@/lib/api/students";
import { listFeeTemplates } from "@/lib/api/settings";
import { useApp } from "@/lib/context/app-context";

export function RecordPaymentModal({
  defaultStudentId,
  trigger,
}: {
  defaultStudentId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { activeBranchId } = useApp();
  const queryClient = useQueryClient();

  const { data: studentsData } = useQuery({
    queryKey: ["students", { branchId: activeBranchId, page: 1, pageSize: 100 }],
    queryFn: () => listStudents({ data: { branchId: activeBranchId, pageSize: 100 } }),
    enabled: open,
  });

  const { data: feeTemplates = [] } = useQuery({
    queryKey: ["fee-templates"],
    queryFn: () => listFeeTemplates(),
    enabled: open,
  });

  const [studentId, setStudentId] = useState(defaultStudentId || "");
  const [feeType, setFeeType] = useState("Service Charges");
  const [amount, setAmount] = useState("85000");
  const [paid, setPaid] = useState("85000");
  const [currency, setCurrency] = useState("INR");
  const [mode, setMode] = useState("UPI");
  const [reference, setReference] = useState("");

  const students = studentsData?.items || [];

  const mutation = useMutation({
    mutationFn: () =>
      recordPayment({
        data: {
          studentId,
          type: feeType,
          amount: parseFloat(amount) || 0,
          paid: parseFloat(paid) || 0,
          currency,
          mode,
          reference: reference || undefined,
        },
      }),
    onSuccess: (payment) => {
      toast.success(`Receipt ${payment.receipt_no} recorded successfully!`);
      queryClient.invalidateQueries({ queryKey: ["payments-summary"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      setOpen(false);
      setReference("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to record payment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      toast.error("Please select a student");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="rounded-xl gradient-warm text-primary-foreground">
            <Plus className="mr-1.5 size-4" /> Record payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="size-5 text-primary" /> Record Fee Receipt
            </DialogTitle>
            <DialogDescription>
              Create an official payment receipt for a student file.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <div className="space-y-1">
              <Label>Student File *</Label>
              <Select value={studentId} onValueChange={setStudentId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select student file" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.code}) — {s.branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Fee Category</Label>
                <Select
                  value={feeType}
                  onValueChange={(val) => {
                    setFeeType(val);
                    const tmpl = feeTemplates.find((t) => t.name === val);
                    if (tmpl) {
                      setAmount(tmpl.amount.toString());
                      setPaid(tmpl.amount.toString());
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feeTemplates.length > 0 ? (
                      feeTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="Service Charges">Service Charges</SelectItem>
                        <SelectItem value="Visa Fee">Visa Fee</SelectItem>
                        <SelectItem value="University Deposit">University Deposit</SelectItem>
                        <SelectItem value="Registration Fee">Registration Fee</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="AUD">AUD ($)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="amount">Total Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="85000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="paid">Amount Paid Now *</Label>
                <Input
                  id="paid"
                  type="number"
                  placeholder="85000"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Payment Mode</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI / GPay</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="NEFT">NEFT / NetBanking</SelectItem>
                    <SelectItem value="Wire">Wire Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ref">Reference / UTR</Label>
                <Input
                  id="ref"
                  placeholder="e.g. UTR-98214"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
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
              className="gradient-warm text-primary-foreground"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Recording...
                </>
              ) : (
                "Issue Receipt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
