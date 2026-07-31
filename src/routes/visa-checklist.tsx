import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/crm/PageHeader";
import { ChecklistBoard, type ChecklistSection } from "@/components/crm/ChecklistBoard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/visa-checklist")({
  head: () => ({
    meta: [
      { title: "Visa Checklist — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Visa filing checklist covering identity, financial, medical and biometric requirements.",
      },
      { property: "og:title", content: "Visa Checklist — APEX Abroad CRM" },
      { property: "og:description", content: "Everything needed before a student's visa file is lodged." },
    ],
  }),
  component: VisaChecklist,
});

const sections: ChecklistSection[] = [
  {
    title: "Identity & travel",
    items: [
      { id: "v1", label: "Passport first & last page", required: true, status: "Received", deadline: "12 Aug", owner: "Neha Gupta" },
      { id: "v2", label: "Passport size photographs", required: true, status: "Received", deadline: "12 Aug", owner: "Neha Gupta" },
      { id: "v3", label: "Previous visa refusals disclosure", required: false, status: "Waived", deadline: "—", owner: "Neha Gupta" },
    ],
  },
  {
    title: "Financial",
    items: [
      { id: "v4", label: "Bank statement (6 months)", required: true, status: "Pending", deadline: "16 Aug", owner: "Suresh Babu" },
      { id: "v5", label: "Education loan sanction letter", required: false, status: "Received", deadline: "14 Aug", owner: "Suresh Babu" },
      { id: "v6", label: "Sponsor affidavit", required: true, status: "Rejected", deadline: "10 Aug", owner: "Suresh Babu" },
      { id: "v7", label: "Tuition deposit receipt", required: true, status: "Pending", deadline: "18 Aug", owner: "Suresh Babu" },
    ],
  },
  {
    title: "Health & appointments",
    items: [
      { id: "v8", label: "Medical examination report", required: true, status: "Pending", deadline: "20 Aug", owner: "Neha Gupta" },
      { id: "v9", label: "Biometrics appointment slip", required: true, status: "Received", deadline: "17 Aug", owner: "Neha Gupta" },
      { id: "v10", label: "Travel insurance", required: false, status: "Pending", deadline: "26 Aug", owner: "Divya Nair" },
    ],
  },
];

function VisaChecklist() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Visa Checklist"
        description="Template: United Kingdom → Student Route."
        crumbs={["Casework", "Visa Checklist"]}
        actions={
          <Button size="sm" variant="outline" className="rounded-xl">
            Edit template
          </Button>
        }
      />
      <ChecklistBoard sections={sections} />
    </div>
  );
}
