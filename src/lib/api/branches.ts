import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export type BranchWithCounts = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  status: "active" | "archived";
  students: number;
  revenue: number;
  staff: number;
  applications: number;
};

export const listBranches = createServerFn({ method: "GET" }).handler(
  async (): Promise<BranchWithCounts[]> => {
    const supabase = createSupabaseServerClient();
    const { data: branches, error } = await supabase
      .from("branches")
      .select("*")
      .order("name");

    if (error || !branches) {
      console.error("Error fetching branches:", error);
      return [];
    }

    // Fetch counts and revenue for each branch
    const results: BranchWithCounts[] = [];
    for (const b of branches) {
      const [
        { count: studentCount },
        { count: staffCount },
        { data: studentList },
      ] = await Promise.all([
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("branch_id", b.id)
          .is("deleted_at", null),
        supabase
          .from("staff_branches")
          .select("*", { count: "exact", head: true })
          .eq("branch_id", b.id),
        supabase
          .from("students")
          .select("id")
          .eq("branch_id", b.id)
          .is("deleted_at", null),
      ]);

      let appCount = 0;
      let branchRevenue = 0;

      const studentIds = studentList?.map((s) => s.id) || [];
      if (studentIds.length > 0) {
        const [{ count: apps }, { data: payments }] = await Promise.all([
          supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .in("student_id", studentIds),
          supabase
            .from("payments")
            .select("paid")
            .in("student_id", studentIds),
        ]);
        appCount = apps || 0;
        branchRevenue =
          payments?.reduce((sum, p) => sum + Number(p.paid || 0), 0) || 0;
      }

      results.push({
        id: b.id,
        name: b.name,
        city: b.city,
        address: b.address,
        phone: b.phone,
        status: b.status as "active" | "archived",
        students: studentCount || 0,
        staff: staffCount || 0,
        applications: appCount,
        revenue: branchRevenue,
      });
    }

    return results;
  }
);

export const createBranch = createServerFn({ method: "POST" })
  .validator((data: { name: string; city: string; address?: string; phone?: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { data: created, error } = await supabase
      .from("branches")
      .insert({
        name: data.name,
        city: data.city,
        address: data.address || null,
        phone: data.phone || null,
        status: "active",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Created branch ${created.name}`,
      entity_type: "branch",
      entity_id: created.id,
      branch_id: created.id,
    });

    return created;
  });

export const updateBranch = createServerFn({ method: "POST" })
  .validator((data: { id: string; name?: string; city?: string; address?: string; phone?: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { id, ...updates } = data;
    const { data: updated, error } = await supabase
      .from("branches")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Updated branch ${updated.name}`,
      entity_type: "branch",
      entity_id: updated.id,
      branch_id: updated.id,
    });

    return updated;
  });

export const archiveBranch = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { data: updated, error } = await supabase
      .from("branches")
      .update({ status: "archived" })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Archived branch ${updated.name}`,
      entity_type: "branch",
      entity_id: updated.id,
      branch_id: updated.id,
    });

    return updated;
  });
