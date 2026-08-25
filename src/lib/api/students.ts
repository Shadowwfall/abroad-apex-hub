import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export type StudentListItem = {
  id: string;
  code: string;
  name: string;
  branch: string;
  branchId: string;
  country: string;
  intake: string;
  status: string;
  counsellor: string;
  counsellorId: string | null;
  outstanding: number;
  initials: string;
  createdAt: string;
};

export type FullStudentDetail = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  passport: string;
  address: string;
  branchId: string;
  branchName: string;
  counsellorId: string | null;
  counsellorName: string;
  status: string;
  preferredIntake: string;
  highestQualification: string;
  percentage: string;
  englishTest: string;
  workExperience: string;
  destinations: Array<{
    id: string;
    country: string;
    university: string;
    course: string;
    intake: string;
    applicationStatus: string;
    visaStatus: string;
    extraRequirements: string[];
    admissionItems: Array<{
      id: string;
      label: string;
      note?: string | null;
      optional: boolean;
      status: string;
    }>;
    visaItems: Array<{
      id: string;
      label: string;
      note?: string | null;
      optional: boolean;
      status: string;
    }>;
  }>;
  uploads: Array<{
    id: string;
    name: string;
    uploaded: string;
    status: string;
    reviewer: string;
    remark?: string;
    storageKey: string;
  }>;
  payments: Array<{
    id: string;
    type: string;
    amount: number;
    paid: number;
    currency: string;
    mode: string;
    date: string;
    status: string;
  }>;
  forms: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
    owner: string;
  }>;
  totals: {
    paid: number;
    pending: number;
    currency: string;
  };
};

export const listStudents = createServerFn({ method: "GET" })
  .validator(
    (params?: {
      branchId?: string;
      q?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    }) => params || {}
  )
  .handler(async ({ data }): Promise<{ items: StudentListItem[]; total: number }> => {
    const supabase = createSupabaseServerClient();
    const page = data.page || 1;
    const pageSize = data.pageSize || 25;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("students")
      .select(
        `
        id,
        code,
        name,
        branch_id,
        counsellor_id,
        status,
        preferred_intake,
        created_at,
        branches(id, name),
        users!students_counsellor_id_fkey(id, name),
        student_destinations(country, intake),
        payments(amount, paid)
      `,
        { count: "exact" }
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (data.branchId && data.branchId !== "all") {
      query = query.eq("branch_id", data.branchId);
    }

    if (data.status && data.status !== "all") {
      query = query.eq("status", data.status);
    }

    if (data.q && data.q.trim() !== "") {
      const q = data.q.trim();
      query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
    }

    query = query.range(from, to);

    const { data: records, count, error } = await query;

    if (error || !records) {
      console.error("Error listing students:", error);
      return { items: [], total: 0 };
    }

    const items: StudentListItem[] = records.map((r: any) => {
      const branchName = r.branches?.name || "Unassigned";
      const counsellorName = r.users?.name || "Unassigned";
      const firstDest = r.student_destinations?.[0];
      const country = firstDest?.country || "—";
      const intake = firstDest?.intake || r.preferred_intake || "—";

      const totalAmount = r.payments?.reduce((s: number, p: any) => s + Number(p.amount || 0), 0) || 0;
      const totalPaid = r.payments?.reduce((s: number, p: any) => s + Number(p.paid || 0), 0) || 0;
      const outstanding = Math.max(0, totalAmount - totalPaid);

      const initials = r.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      return {
        id: r.id,
        code: r.code,
        name: r.name,
        branch: branchName,
        branchId: r.branch_id,
        country,
        intake,
        status: r.status,
        counsellor: counsellorName,
        counsellorId: r.counsellor_id,
        outstanding,
        initials,
        createdAt: r.created_at,
      };
    });

    return { items, total: count || 0 };
  });

export const getStudent = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: studentId }): Promise<FullStudentDetail | null> => {
    const supabase = createSupabaseServerClient();

    // Fetch student by id or code
    let query = supabase
      .from("students")
      .select(
        `
        *,
        branches(id, name),
        users!students_counsellor_id_fkey(id, name)
      `
      )
      .is("deleted_at", null);

    // If param is a UUID vs code
    if (studentId.startsWith("APX-")) {
      query = query.eq("code", studentId);
    } else {
      query = query.eq("id", studentId);
    }

    const { data: student, error } = await query.maybeSingle();

    if (error || !student) {
      return null;
    }

    const actualId = student.id;

    // Fetch all related entities in parallel
    const [
      { data: destinations },
      { data: documents },
      { data: payments },
      { data: forms },
    ] = await Promise.all([
      supabase
        .from("student_destinations")
        .select(
          `
          *,
          student_checklist_items(*)
        `
        )
        .eq("student_id", actualId)
        .order("created_at", { ascending: true }),
      supabase
        .from("documents")
        .select(
          `
          *,
          users!documents_reviewer_id_fkey(name)
        `
        )
        .eq("student_id", actualId)
        .order("uploaded_at", { ascending: false }),
      supabase
        .from("payments")
        .select("*")
        .eq("student_id", actualId)
        .order("paid_on", { ascending: false }),
      supabase
        .from("forms")
        .select(
          `
          *,
          users!forms_owner_id_fkey(name)
        `
        )
        .eq("student_id", actualId)
        .order("created_at", { ascending: true }),
    ]);

    const formattedDestinations = (destinations || []).map((d: any) => {
      const items = d.student_checklist_items || [];
      const admissionItems = items
        .filter((i: any) => i.kind === "admission")
        .map((i: any) => ({
          id: i.id,
          label: i.label,
          note: i.note,
          optional: Boolean(i.optional),
          status: i.status,
        }));
      const visaItems = items
        .filter((i: any) => i.kind === "visa")
        .map((i: any) => ({
          id: i.id,
          label: i.label,
          note: i.note,
          optional: Boolean(i.optional),
          status: i.status,
        }));
      const extraRequirements = items
        .filter((i: any) => i.source === "university_extra")
        .map((i: any) => i.label);

      return {
        id: d.id,
        country: d.country,
        university: d.university || "To be shortlisted",
        course: d.course || "Master's program",
        intake: d.intake || "Upcoming",
        applicationStatus: d.application_status || "Not started",
        visaStatus: d.visa_status || "Not started",
        extraRequirements,
        admissionItems,
        visaItems,
      };
    });

    const formattedUploads = (documents || []).map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      uploaded: doc.uploaded_at
        ? new Date(doc.uploaded_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
      status: doc.status,
      reviewer: doc.users?.name || "Documentation team",
      remark: doc.remark || undefined,
      storageKey: doc.storage_key,
    }));

    const formattedPayments = (payments || []).map((p: any) => ({
      id: p.receipt_no || p.id,
      type: p.type,
      amount: Number(p.amount),
      paid: Number(p.paid),
      currency: p.currency,
      mode: p.mode || "UPI",
      date: p.paid_on || "—",
      status: p.status,
    }));

    const formattedForms = (forms || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      progress: f.progress || 0,
      status: f.status,
      owner: f.users?.name || "Assigned staff",
    }));

    const totalAmount = formattedPayments.reduce((s, p) => s + p.amount, 0);
    const totalPaid = formattedPayments.reduce((s, p) => s + p.paid, 0);
    const pending = Math.max(0, totalAmount - totalPaid);

    return {
      id: student.id,
      code: student.code,
      name: student.name,
      email: student.email || "—",
      phone: student.phone || "—",
      dob: student.dob || "—",
      gender: student.gender || "—",
      passport: student.passport_no
        ? `${student.passport_no}${student.passport_expiry ? ` · exp. ${student.passport_expiry}` : ""}`
        : "Pending submission",
      address: student.address || "Hyderabad, Telangana",
      branchId: student.branch_id,
      branchName: student.branches?.name || "Banjara Hills HQ",
      counsellorId: student.counsellor_id,
      counsellorName: student.users?.name || "Unassigned",
      status: student.status,
      preferredIntake: student.preferred_intake || "Upcoming",
      highestQualification: student.qualification || "Bachelor's degree",
      percentage: student.score || "—",
      englishTest: student.english_test || "Not submitted",
      workExperience: student.work_experience || "—",
      destinations: formattedDestinations,
      uploads: formattedUploads,
      payments: formattedPayments,
      forms: formattedForms,
      totals: {
        paid: totalPaid,
        pending,
        currency: "INR",
      },
    };
  });

export const createStudent = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name: string;
      email?: string;
      phone?: string;
      dob?: string;
      gender?: string;
      passportNo?: string;
      passportExpiry?: string;
      address?: string;
      branchId: string;
      counsellorId?: string;
      country?: string;
      preferredIntake?: string;
      qualification?: string;
      score?: string;
      englishTest?: string;
      workExperience?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();

    const { data: student, error } = await supabase
      .from("students")
      .insert({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        dob: data.dob || null,
        gender: data.gender || null,
        passport_no: data.passportNo || null,
        passport_expiry: data.passportExpiry || null,
        address: data.address || null,
        branch_id: data.branchId,
        counsellor_id: data.counsellorId || null,
        preferred_intake: data.preferredIntake || null,
        qualification: data.qualification || null,
        score: data.score || null,
        english_test: data.englishTest || null,
        work_experience: data.workExperience || null,
        status: "Lead",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If destination country provided, instantiate destination + checklist items
    if (data.country && data.country.trim() !== "") {
      const { data: dest } = await supabase
        .from("student_destinations")
        .insert({
          student_id: student.id,
          country: data.country,
          intake: data.preferredIntake || "Upcoming",
          application_status: "In progress",
          visa_status: "Not started",
        })
        .select()
        .single();

      if (dest) {
        // Fetch templates for country
        const { data: templates } = await supabase
          .from("checklist_templates")
          .select("*")
          .eq("country", data.country);

        if (templates && templates.length > 0) {
          const itemsToInsert = templates.map((t) => ({
            destination_id: dest.id,
            kind: t.kind,
            label: t.label,
            note: t.note,
            optional: t.optional,
            status: "Pending",
            source: "template",
          }));
          await supabase.from("student_checklist_items").insert(itemsToInsert);
        }
      }
    }

    // Record audit log
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Created student file ${student.code}`,
      entity_type: "student",
      entity_id: student.id,
      branch_id: student.branch_id,
      meta: { name: student.name, code: student.code },
    });

    return student;
  });

export const updateStudent = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      name?: string;
      email?: string;
      phone?: string;
      status?: string;
      branchId?: string;
      counsellorId?: string;
      passportNo?: string;
      address?: string;
      qualification?: string;
      score?: string;
      englishTest?: string;
      workExperience?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { id, ...updates } = data;

    const mappedUpdates: any = {};
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.email !== undefined) mappedUpdates.email = updates.email;
    if (updates.phone !== undefined) mappedUpdates.phone = updates.phone;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.branchId !== undefined) mappedUpdates.branch_id = updates.branchId;
    if (updates.counsellorId !== undefined) mappedUpdates.counsellor_id = updates.counsellorId;
    if (updates.passportNo !== undefined) mappedUpdates.passport_no = updates.passportNo;
    if (updates.address !== undefined) mappedUpdates.address = updates.address;
    if (updates.qualification !== undefined) mappedUpdates.qualification = updates.qualification;
    if (updates.score !== undefined) mappedUpdates.score = updates.score;
    if (updates.englishTest !== undefined) mappedUpdates.english_test = updates.englishTest;
    if (updates.workExperience !== undefined) mappedUpdates.work_experience = updates.workExperience;

    const { data: updated, error } = await supabase
      .from("students")
      .update(mappedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });
