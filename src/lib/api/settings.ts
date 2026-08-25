import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export const getOrgSettings = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = createSupabaseServerClient();
    const { data: settings } = await supabase
      .from("org_settings")
      .select("*")
      .limit(1)
      .single();

    return (
      settings || {
        name: "APEX Abroad Consultancy",
        head_office: "Road No. 36, Jubilee Hills, Hyderabad",
        support_email: "contact@apexabroad.in",
        base_currency: "INR",
      }
    );
  }
);

export const updateOrgSettings = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name?: string;
      headOffice?: string;
      supportEmail?: string;
      baseCurrency?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();

    const { data: existing } = await supabase
      .from("org_settings")
      .select("id")
      .limit(1)
      .single();

    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) payload.name = data.name;
    if (data.headOffice !== undefined) payload.head_office = data.headOffice;
    if (data.supportEmail !== undefined) payload.support_email = data.supportEmail;
    if (data.baseCurrency !== undefined) payload.base_currency = data.baseCurrency;

    if (existing) {
      const { data: updated, error } = await supabase
        .from("org_settings")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    } else {
      const { data: created, error } = await supabase
        .from("org_settings")
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return created;
    }
  });

export const listFeeTemplates = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = createSupabaseServerClient();
    const { data: templates, error } = await supabase
      .from("fee_templates")
      .select("*")
      .order("name");

    if (error || !templates) {
      return [];
    }

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      amount: Number(t.amount),
      currency: t.currency,
      active: t.active,
    }));
  }
);

export const updateFeeTemplate = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      name?: string;
      amount?: number;
      currency?: string;
      active?: boolean;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { id, ...updates } = data;

    const { data: updated, error } = await supabase
      .from("fee_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });

export const getNotificationPrefs = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        newLeadEmail: true,
        deadlineReminder: true,
        paymentDigest: true,
        visaAlerts: true,
      };
    }

    const { data: prefs } = await supabase
      .from("notification_prefs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return {
      newLeadEmail: prefs?.new_lead_email ?? true,
      deadlineReminder: prefs?.deadline_reminder ?? true,
      paymentDigest: prefs?.payment_digest ?? true,
      visaAlerts: prefs?.visa_alerts ?? true,
    };
  }
);

export const updateNotificationPrefs = createServerFn({ method: "POST" })
  .validator(
    (data: {
      newLeadEmail?: boolean;
      deadlineReminder?: boolean;
      paymentDigest?: boolean;
      visaAlerts?: boolean;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthenticated");

    const payload: any = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };
    if (data.newLeadEmail !== undefined) payload.new_lead_email = data.newLeadEmail;
    if (data.deadlineReminder !== undefined) payload.deadline_reminder = data.deadlineReminder;
    if (data.paymentDigest !== undefined) payload.payment_digest = data.paymentDigest;
    if (data.visaAlerts !== undefined) payload.visa_alerts = data.visaAlerts;

    const { data: updated, error } = await supabase
      .from("notification_prefs")
      .upsert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updated;
  });
