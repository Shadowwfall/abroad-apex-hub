import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "./supabase/server";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  branches: Array<{ id: string; name: string }>;
  isSuperAdmin: boolean;
};

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthUser | null> => {
    try {
      const supabase = createSupabaseServerClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("users")
        .select("id, name, email, active")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.active) {
        return null;
      }

      // Fetch user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roleList = roles?.map((r) => r.role) || [];
      const primaryRole = roleList[0] || "counsellor";
      const isSuperAdmin = roleList.includes("super_admin");

      // Fetch user branch assignments
      let branches: Array<{ id: string; name: string }> = [];
      if (isSuperAdmin) {
        const { data: allBranches } = await supabase
          .from("branches")
          .select("id, name")
          .eq("status", "active")
          .order("name");
        branches = allBranches || [];
      } else {
        const { data: staffBranches } = await supabase
          .from("staff_branches")
          .select("branch:branches(id, name)")
          .eq("user_id", user.id);
        branches =
          staffBranches
            ?.map((sb) => sb.branch)
            .filter((b): b is { id: string; name: string } => Boolean(b)) || [];
      }

      return {
        id: user.id,
        email: user.email || profile.email,
        name: profile.name || user.email?.split("@")[0] || "Staff Member",
        role: primaryRole,
        branches,
        isSuperAdmin,
      };
    } catch (err) {
      console.error("Error fetching current user session:", err);
      return null;
    }
  }
);
