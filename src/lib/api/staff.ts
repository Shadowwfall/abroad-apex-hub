import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export type StaffItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  branches: string[];
  branchIds: string[];
  active: boolean;
  initials: string;
};

export const listStaff = createServerFn({ method: "GET" })
  .validator((params?: { branchId?: string; q?: string }) => params || {})
  .handler(async ({ data }): Promise<StaffItem[]> => {
    const supabase = createSupabaseServerClient();

    const { data: users, error } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        active,
        user_roles(role),
        staff_branches(branch_id, branches(id, name))
      `,
      )
      .order("name");

    if (error || !users) {
      console.error("Error listing staff:", error);
      return [];
    }

    return users.map((u: any) => {
      const roles = u.user_roles?.map((r: any) => r.role) || [];
      const primaryRole = roles[0] || "Counsellor";
      const isSuperAdmin = roles.includes("super_admin");

      const staffBranches = u.staff_branches || [];
      const branchNames = isSuperAdmin
        ? ["All branches"]
        : staffBranches.map((sb: any) => sb.branches?.name).filter(Boolean);
      const branchIds = staffBranches.map((sb: any) => sb.branch_id);

      const initials = u.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: formatRoleName(primaryRole),
        branches: branchNames.length > 0 ? branchNames : ["Unassigned"],
        branchIds,
        active: u.active,
        initials,
      };
    });
  });

function formatRoleName(role: string) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "branch_admin":
      return "Branch Admin";
    case "counsellor":
      return "Counsellor";
    case "doc_officer":
      return "Documentation Officer";
    case "finance":
      return "Finance";
    case "visa_team":
      return "Visa Team";
    default:
      return role;
  }
}

export const updateStaffStatus = createServerFn({ method: "POST" })
  .validator((data: { staffId: string; active: boolean }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { data: updated, error } = await supabase
      .from("users")
      .update({ active: data.active })
      .eq("id", data.staffId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });
