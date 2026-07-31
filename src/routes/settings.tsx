import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/crm/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content: "Organisation profile, fee templates and notification preferences for APEX Abroad.",
      },
      { property: "og:title", content: "Settings — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Configure templates, currencies and alerts." },
    ],
  }),
  component: SettingsPage,
});

const feeTemplates = [
  { name: "Admission Fee", amount: "₹25,000", currency: "INR" },
  { name: "Visa Fee", amount: "₹45,000", currency: "INR" },
  { name: "University Deposit", amount: "€2,500", currency: "EUR" },
  { name: "Embassy Fee", amount: "£490", currency: "GBP" },
  { name: "Medical", amount: "₹6,500", currency: "INR" },
  { name: "Insurance", amount: "$680", currency: "USD" },
  { name: "Service Charges", amount: "₹60,000", currency: "INR" },
];

function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Settings"
        description="Organisation, fee templates and notification preferences."
        crumbs={["Settings"]}
      />

      <Tabs defaultValue="org" className="animate-rise">
        <TabsList className="rounded-xl">
          <TabsTrigger value="org" className="rounded-lg">
            Organisation
          </TabsTrigger>
          <TabsTrigger value="fees" className="rounded-lg">
            Fee templates
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-lg">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="mt-4">
          <div className="surface-card space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="org">Consultancy name</Label>
                <Input id="org" defaultValue="APEX Abroad Consultancy" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Head office</Label>
                <Input id="city" defaultValue="Banjara Hills, Hyderabad" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Support email</Label>
                <Input id="email" defaultValue="care@apexabroad.in" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cur">Base currency</Label>
                <Input id="cur" defaultValue="INR — Indian Rupee" className="rounded-xl" />
              </div>
            </div>
            <Button
              className="rounded-xl gradient-warm text-primary-foreground"
              onClick={() => toast.success("Organisation settings saved")}
            >
              Save changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          <div className="surface-card divide-y divide-border/70">
            {feeTemplates.map((f) => (
              <div key={f.name} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <Badge variant="secondary" className="mt-1 rounded-full text-[10px]">
                    {f.currency}
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-display text-base font-semibold">{f.amount}</span>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="surface-card divide-y divide-border/70">
            {[
              "Email me when a new website lead arrives",
              "Notify counsellors 3 days before a document deadline",
              "Daily digest of pending payments",
              "Alert on visa decision updates",
            ].map((label, i) => (
              <div key={label} className="flex items-center justify-between gap-4 p-4">
                <p className="min-w-0 text-sm">{label}</p>
                <Switch defaultChecked={i !== 2} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
