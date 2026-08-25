import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export type PaymentSummaryRow = {
  studentId: string;
  studentCode: string;
  studentName: string;
  branch: string;
  branchId: string;
  counsellor: string;
  paid: number;
  pending: number;
  status: "Paid" | "Pending" | "Partial" | "Refunded";
  paymentsCount: number;
};

export const listPaymentsSummary = createServerFn({ method: "GET" })
  .validator(
    (params?: {
      branchId?: string;
      q?: string;
      page?: number;
      pageSize?: number;
    }) => params || {}
  )
  .handler(async ({ data }): Promise<{ items: PaymentSummaryRow[]; total: number }> => {
    const supabase = createSupabaseServerClient();

    let query = supabase
      .from("students")
      .select(
        `
        id,
        code,
        name,
        branch_id,
        branches(name),
        users!students_counsellor_id_fkey(name),
        payments(id, amount, paid, status)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null)
      .order("name");

    if (data.branchId && data.branchId !== "all") {
      query = query.eq("branch_id", data.branchId);
    }

    if (data.q && data.q.trim() !== "") {
      const q = data.q.trim();
      query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
    }

    const { data: students, count, error } = await query;

    if (error || !students) {
      console.error("Error listing payments summary:", error);
      return { items: [], total: 0 };
    }

    const items: PaymentSummaryRow[] = students.map((s: any) => {
      const payments = s.payments || [];
      const totalAmount = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
      const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.paid || 0), 0);
      const pending = Math.max(0, totalAmount - totalPaid);

      let status: "Paid" | "Pending" | "Partial" | "Refunded" = "Pending";
      if (payments.length === 0) {
        status = "Pending";
      } else if (pending === 0 && totalPaid > 0) {
        status = "Paid";
      } else if (totalPaid > 0 && pending > 0) {
        status = "Partial";
      } else if (payments.some((p: any) => p.status === "Refunded")) {
        status = "Refunded";
      }

      return {
        studentId: s.id,
        studentCode: s.code,
        studentName: s.name,
        branch: s.branches?.name || "Unassigned",
        branchId: s.branch_id,
        counsellor: s.users?.name || "Unassigned",
        paid: totalPaid,
        pending,
        status,
        paymentsCount: payments.length,
      };
    });

    return { items, total: count || 0 };
  });

export const recordPayment = createServerFn({ method: "POST" })
  .validator(
    (data: {
      studentId: string;
      type: string;
      amount: number;
      paid: number;
      currency?: string;
      exchangeRate?: number;
      mode: string;
      date?: string;
      reference?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let status = "Pending";
    if (data.paid >= data.amount) {
      status = "Paid";
    } else if (data.paid > 0) {
      status = "Partial";
    }

    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        student_id: data.studentId,
        type: data.type,
        amount: data.amount,
        paid: data.paid,
        currency: data.currency || "INR",
        exchange_rate: data.exchangeRate || 1.0,
        mode: data.mode,
        paid_on: data.date || new Date().toISOString().split("T")[0],
        reference: data.reference || null,
        status,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Record audit log
    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Recorded payment ${payment.receipt_no} (${payment.currency} ${payment.paid})`,
      entity_type: "payment",
      entity_id: payment.id,
      meta: { studentId: data.studentId, amount: data.amount, paid: data.paid },
    });

    return payment;
  });

export const refundPayment = createServerFn({ method: "POST" })
  .validator((data: { paymentId: string; amount: number; reason?: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: refund, error } = await supabase
      .from("payment_refunds")
      .insert({
        payment_id: data.paymentId,
        amount: data.amount,
        reason: data.reason || null,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Update payment status
    await supabase
      .from("payments")
      .update({ status: "Refunded" })
      .eq("id", data.paymentId);

    return refund;
  });
