import { createServerFn } from "@tanstack/react-start";
import { createSupabaseServerClient } from "../supabase/server";

export const createDocumentRecord = createServerFn({ method: "POST" })
  .validator(
    (data: {
      studentId: string;
      name: string;
      storageKey: string;
      mime?: string;
      sizeBytes?: number;
      checklistId?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: doc, error } = await supabase
      .from("documents")
      .insert({
        student_id: data.studentId,
        name: data.name,
        storage_key: data.storageKey,
        mime: data.mime || null,
        size_bytes: data.sizeBytes || null,
        checklist_item_id: data.checklistId || null,
        status: "Received",
        uploaded_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (data.checklistId) {
      await supabase
        .from("student_checklist_items")
        .update({
          status: "Received",
          document_id: doc.id,
          updated_by: user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.checklistId);
    }

    // Audit log
    await supabase.from("audit_log").insert({
      actor_id: user?.id || null,
      action: `Uploaded document: ${data.name}`,
      entity_type: "document",
      entity_id: doc.id,
      meta: { studentId: data.studentId, name: data.name },
    });

    return doc;
  });

export const reviewDocument = createServerFn({ method: "POST" })
  .validator(
    (data: {
      docId: string;
      status: "Approved" | "Rejected" | "Received" | "Waived";
      remark?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: updated, error } = await supabase
      .from("documents")
      .update({
        status: data.status,
        remark: data.remark || null,
        reviewer_id: user?.id || null,
      })
      .eq("id", data.docId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If doc is linked to a checklist item, update the checklist item too
    if (updated.checklist_item_id) {
      await supabase
        .from("student_checklist_items")
        .update({
          status: data.status,
          updated_by: user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updated.checklist_item_id);
    }

    return updated;
  });

export const getDocumentDownloadUrl = createServerFn({ method: "POST" })
  .validator((data: { storageKey: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const { data: signed, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(data.storageKey, 300); // 5 minutes validity

    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
