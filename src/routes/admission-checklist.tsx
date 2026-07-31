import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/crm/PageHeader";
import { ChecklistBoard, type ChecklistSection } from "@/components/crm/ChecklistBoard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admission-checklist")({
  head: () => ({
    meta: [
      { title: "Admission Checklist — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Country and level-wise admission checklist templates with required and optional documents.",
      },
      { property: "og:title", content: "Admission Checklist — APEX Abroad CRM" },
      { property: "og:description", content: "Track academic, testing and application documents." },
    ],
  }),
  component: AdmissionChecklist,
});

const sections: ChecklistSection[] = [
  {
    title: "Academic records",
    items: [
      { id: "a1", label: "10th & 12th marks memos", required: true, status: "Received", deadline: "02 Aug", owner: "Priya Menon" },
      { id: "a2", label: "Degree consolidated marksheet", required: true, status: "Received", deadline: "02 Aug", owner: "Priya Menon" },
      { id: "a3", label: "Provisional / degree certificate", required: true, status: "Pending", deadline: "08 Aug", owner: "Priya Menon" },
      { id: "a4", label: "Backlog certificate", required: false, status: "Waived", deadline: "—", owner: "Divya Nair" },
    ],
  },
  {
    title: "Test scores",
    items: [
      { id: "b1", label: "IELTS / PTE scorecard", required: true, status: "Received", deadline: "05 Aug", owner: "Neha Gupta" },
      { id: "b2", label: "GRE / GMAT scorecard", required: false, status: "Pending", deadline: "14 Aug", owner: "Neha Gupta" },
    ],
  },
  {
    title: "Application pack",
    items: [
      { id: "c1", label: "Statement of Purpose", required: true, status: "Pending", deadline: "05 Aug", owner: "Priya Menon" },
      { id: "c2", label: "Letters of Recommendation (2)", required: true, status: "Received", deadline: "04 Aug", owner: "Ravi Teja" },
      { id: "c3", label: "Updated CV", required: true, status: "Rejected", deadline: "06 Aug", owner: "Ravi Teja" },
      { id: "c4", label: "Work experience letter", required: false, status: "Waived", deadline: "—", owner: "Divya Nair" },
    ],
  },
];

function AdmissionChecklist() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Admission Checklist"
        description="Template: India → Postgraduate → Canada vertical."
        crumbs={["Casework", "Admission Checklist"]}
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
