import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export type ActivityItem = {
  id: string;
  user: string;
  initials: string;
  action: string;
  target: string;
  branch: string;
  time: string;
  tone: "success" | "info" | "warning" | "default";
};

export const listActivities = createServerFn({ method: "GET" })
  .validator((params?: { branchId?: string; limit?: number }) => params || {})
  .handler(async ({ data }): Promise<ActivityItem[]> => {
    const supabase = createSupabaseServerClient();
    const limit = data.limit || 20;

    let query = supabase
      .from("audit_log")
      .select(
        `
        id,
        action,
        entity_type,
        entity_id,
        meta,
        created_at,
        users(name),
        branches(name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (data.branchId && data.branchId !== "all") {
      query = query.eq("branch_id", data.branchId);
    }

    const { data: logs, error } = await query;

    if (error || !logs) {
      console.error("Error fetching activity logs:", error);
      return [];
    }

    return logs.map((l: any) => {
      const userName = l.users?.name || "System";
      const initials = userName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      const branchName = l.branches?.name || "General";
      const target = l.meta?.name || l.meta?.code || l.entity_type || "";

      let tone: "success" | "info" | "warning" | "default" = "info";
      if (l.action.includes("approved") || l.action.includes("payment")) {
        tone = "success";
      } else if (l.action.includes("rejected") || l.action.includes("pending")) {
        tone = "warning";
      } else if (l.action.includes("refund")) {
        tone = "default";
      }

      const created = new Date(l.created_at || Date.now());
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

      let timeAgo = "";
      if (diffMinutes < 1) timeAgo = "Just now";
      else if (diffMinutes < 60) timeAgo = `${diffMinutes} min ago`;
      else if (diffMinutes < 1440) timeAgo = `${Math.floor(diffMinutes / 60)} hours ago`;
      else timeAgo = created.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

      return {
        id: l.id,
        user: userName,
        initials,
        action: l.action,
        target,
        branch: branchName,
        time: timeAgo,
        tone,
      };
    });
  });
