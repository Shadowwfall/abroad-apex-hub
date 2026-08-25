import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export type LeadItem = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string;
  program: string;
  source: string;
  date: string;
  priority: "High" | "Medium" | "Low";
  status: string;
  branchId: string | null;
  assignedTo: string | null;
  assignedName?: string;
};

export const listLeads = createServerFn({ method: "GET" })
  .validator(
    (params?: {
      branchId?: string;
      status?: string;
    }) => params || {}
  )
  .handler(async ({ data }): Promise<LeadItem[]> => {
    const supabase = createSupabaseServerClient();

    let query = supabase
      .from("leads")
      .select(
        `
        *,
        users!leads_assigned_to_fkey(name)
      `
      )
      .order("created_at", { ascending: false });

    if (data.branchId && data.branchId !== "all") {
      query = query.eq("branch_id", data.branchId);
    }

    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }

    const { data: records, error } = await query;

    if (error || !records) {
      console.error("Error fetching leads:", error);
      return [];
    }

    return records.map((r: any) => {
      const created = new Date(r.created_at || Date.now());
      const now = new Date();
      const isToday = created.toDateString() === now.toDateString();

      const timeStr = created.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const dateDisplay = isToday
        ? `Today, ${timeStr}`
        : created.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          });

      return {
        id: r.id,
        code: r.code,
        name: r.name,
        email: r.email,
        phone: r.phone,
        country: r.country || "—",
        program: r.program || "—",
        source: r.source || "Website",
        date: dateDisplay,
        priority: (r.priority as "High" | "Medium" | "Low") || "Medium",
        status: r.status,
        branchId: r.branch_id,
        assignedTo: r.assigned_to,
        assignedName: r.users?.name,
      };
    });
  });

export const createLead = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name: string;
      email?: string;
      phone?: string;
      country?: string;
      program?: string;
      source?: string;
      priority?: "High" | "Medium" | "Low";
      branchId?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        country: data.country || null,
        program: data.program || null,
        source: data.source || "Website",
        priority: data.priority || "Medium",
        branch_id: data.branchId || null,
        status: "new",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Audit log
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Created lead ${lead.code}`,
      entity_type: "lead",
      entity_id: lead.id,
      branch_id: lead.branch_id,
      meta: { name: lead.name, code: lead.code },
    });

    return lead;
  });

export const convertLeadToStudent = createServerFn({ method: "POST" })
  .validator(
    (data: {
      leadId: string;
      branchId: string;
      counsellorId?: string;
      intake?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. Fetch the lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", data.leadId)
      .single();

    if (leadError || !lead) {
      throw new Error("Lead not found");
    }

    if (lead.status === "converted") {
      throw new Error("Lead is already converted");
    }

    // 2. Create student record
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        branch_id: data.branchId,
        counsellor_id: data.counsellorId || null,
        preferred_intake: data.intake || "Upcoming",
        status: "Counselling",
      })
      .select()
      .single();

    if (studentError || !student) {
      throw new Error(studentError?.message || "Failed to create student from lead");
    }

    // 3. If lead had country/program, create student destination
    if (lead.country) {
      const { data: dest } = await supabase
        .from("student_destinations")
        .insert({
          student_id: student.id,
          country: lead.country,
          course: lead.program || null,
          intake: data.intake || "Upcoming",
        })
        .select()
        .single();

      if (dest) {
        const { data: templates } = await supabase
          .from("checklist_templates")
          .select("*")
          .eq("country", lead.country);

        if (templates && templates.length > 0) {
          const items = templates.map((t) => ({
            destination_id: dest.id,
            kind: t.kind,
            label: t.label,
            note: t.note,
            optional: t.optional,
            status: "Pending",
          }));
          await supabase.from("student_checklist_items").insert(items);
        }
      }
    }

    // 4. Update lead status
    await supabase
      .from("leads")
      .update({
        status: "converted",
        converted_student_id: student.id,
      })
      .eq("id", data.leadId);

    // 5. Add audit log
    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Converted lead ${lead.code} to student ${student.code}`,
      entity_type: "student",
      entity_id: student.id,
      branch_id: data.branchId,
      meta: { leadId: data.leadId, studentCode: student.code, name: student.name },
    });

    return { student, leadId: data.leadId };
  });

export const assignLead = createServerFn({ method: "POST" })
  .validator((data: { leadId: string; counsellorId: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { data: updated, error } = await supabase
      .from("leads")
      .update({
        assigned_to: data.counsellorId,
        status: "assigned",
      })
      .eq("id", data.leadId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });

export const addLeadNote = createServerFn({ method: "POST" })
  .validator((data: { leadId: string; body: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: note, error } = await supabase
      .from("lead_notes")
      .insert({
        lead_id: data.leadId,
        author_id: user?.id || null,
        body: data.body,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return note;
  });
