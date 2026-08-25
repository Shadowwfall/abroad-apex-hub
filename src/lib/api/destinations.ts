import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export const addDestination = createServerFn({ method: "POST" })
  .validator(
    (data: {
      studentId: string;
      country: string;
      university?: string;
      course?: string;
      intake?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();

    // Insert destination
    const { data: dest, error } = await supabase
      .from("student_destinations")
      .insert({
        student_id: data.studentId,
        country: data.country,
        university: data.university || null,
        course: data.course || null,
        intake: data.intake || "Upcoming",
        application_status: "Not started",
        visa_status: "Not started",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Fetch checklist templates for this country
    const { data: templates } = await supabase
      .from("checklist_templates")
      .select("*")
      .eq("country", data.country)
      .order("sort_order");

    if (templates && templates.length > 0) {
      const checklistItems = templates.map((t) => ({
        destination_id: dest.id,
        kind: t.kind,
        label: t.label,
        note: t.note,
        optional: t.optional,
        status: "Pending",
        source: "template",
      }));

      await supabase.from("student_checklist_items").insert(checklistItems);
    }

    // Add audit log
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Added destination ${data.country}`,
      entity_type: "destination",
      entity_id: dest.id,
      meta: { studentId: data.studentId, country: data.country },
    });

    return dest;
  });

export const updateDestination = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      university?: string;
      course?: string;
      intake?: string;
      applicationStatus?: string;
      visaStatus?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { id, ...updates } = data;

    const mapped: any = {};
    if (updates.university !== undefined) mapped.university = updates.university;
    if (updates.course !== undefined) mapped.course = updates.course;
    if (updates.intake !== undefined) mapped.intake = updates.intake;
    if (updates.applicationStatus !== undefined) mapped.application_status = updates.applicationStatus;
    if (updates.visaStatus !== undefined) mapped.visa_status = updates.visaStatus;

    const { data: updated, error } = await supabase
      .from("student_destinations")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });

export const removeDestination = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("student_destinations")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updateChecklistItemStatus = createServerFn({ method: "POST" })
  .validator(
    (data: {
      itemId: string;
      status: "Pending" | "Received" | "Approved" | "Rejected" | "Waived";
      remark?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();

    const { data: updated, error } = await supabase
      .from("student_checklist_items")
      .update({
        status: data.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.itemId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });
