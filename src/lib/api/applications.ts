import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export type ApplicationCard = {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  branch: string;
  branchId: string;
  country: string;
  university?: string;
  course?: string;
  intake: string;
  stage: string;
  counsellor: string;
  initials: string;
};

export const listApplications = createServerFn({ method: "GET" })
  .validator((params?: { branchId?: string }) => params || {})
  .handler(async ({ data }): Promise<ApplicationCard[]> => {
    const supabase = createSupabaseServerClient();

    let query = supabase
      .from("students")
      .select(
        `
        id,
        code,
        name,
        branch_id,
        status,
        preferred_intake,
        branches(name),
        users!students_counsellor_id_fkey(name),
        student_destinations(id, country, university, course, intake, application_status)
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (data.branchId && data.branchId !== "all") {
      query = query.eq("branch_id", data.branchId);
    }

    const { data: students, error } = await query;

    if (error || !students) {
      console.error("Error listing applications:", error);
      return [];
    }

    const results: ApplicationCard[] = [];

    students.forEach((s: any) => {
      const initials = s.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      const branchName = s.branches?.name || "Unassigned";
      const counsellorName = s.users?.name || "Unassigned";

      if (s.student_destinations && s.student_destinations.length > 0) {
        s.student_destinations.forEach((d: any) => {
          results.push({
            id: d.id,
            studentId: s.id,
            studentCode: s.code,
            studentName: s.name,
            branch: branchName,
            branchId: s.branch_id,
            country: d.country,
            university: d.university || undefined,
            course: d.course || undefined,
            intake: d.intake || s.preferred_intake || "Upcoming",
            stage: s.status,
            counsellor: counsellorName,
            initials,
          });
        });
      } else {
        results.push({
          id: s.id,
          studentId: s.id,
          studentCode: s.code,
          studentName: s.name,
          branch: branchName,
          branchId: s.branch_id,
          country: "—",
          intake: s.preferred_intake || "Upcoming",
          stage: s.status,
          counsellor: counsellorName,
          initials,
        });
      }
    });

    return results;
  });

export const updateApplicationStage = createServerFn({ method: "POST" })
  .validator((data: { studentId: string; stage: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: updated, error } = await supabase
      .from("students")
      .update({ status: data.stage })
      .eq("id", data.studentId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Record audit log
    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Moved student ${updated.name} to ${data.stage}`,
      entity_type: "application",
      entity_id: data.studentId,
      branch_id: updated.branch_id,
      meta: { stage: data.stage },
    });

    return updated;
  });
