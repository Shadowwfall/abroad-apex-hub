import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/crm/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  getOrgSettings,
  updateOrgSettings,
  listFeeTemplates,
  getNotificationPrefs,
  updateNotificationPrefs,
} from "@/lib/api/settings";
import { money } from "@/data/crm";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — APEX Abroad Consultancy CRM" },
      {
        name: "description",
        content:
          "Organisation profile, fee templates and notification preferences for APEX Abroad.",
      },
      { property: "og:title", content: "Settings — APEX Abroad Consultancy CRM" },
      { property: "og:description", content: "Configure templates, currencies and alerts." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ["org-settings"],
    queryFn: () => getOrgSettings(),
  });

  const { data: feeTemplates = [] } = useQuery({
    queryKey: ["fee-templates"],
    queryFn: () => listFeeTemplates(),
  });

  const { data: prefs } = useQuery({
    queryKey: ["notification-prefs"],
    queryFn: () => getNotificationPrefs(),
  });

  const [orgForm, setOrgForm] = useState({
    name: "",
    headOffice: "",
    supportEmail: "",
    baseCurrency: "INR",
  });

  useEffect(() => {
    if (org) {
      setOrgForm({
        name: org.name || "APEX Abroad Consultancy",
        headOffice: org.head_office || "Road No. 36, Jubilee Hills, Hyderabad",
        supportEmail: org.support_email || "contact@apexabroad.in",
        baseCurrency: org.base_currency || "INR",
      });
    }
  }, [org]);

  const updateOrgMutation = useMutation({
    mutationFn: () => updateOrgSettings({ data: orgForm }),
    onSuccess: () => {
      toast.success("Organisation settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["org-settings"] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update settings"),
  });

  const updatePrefsMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateNotificationPrefs>[0]["data"]) =>
      updateNotificationPrefs({ data }),
    onSuccess: () => {
      toast.success("Preferences updated");
      queryClient.invalidateQueries({ queryKey: ["notification-prefs"] });
    },
  });

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Settings"
        description="Organisation profile, fee templates and notification preferences."
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
            {orgLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="org">Consultancy name</Label>
                    <Input
                      id="org"
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">Head office</Label>
                    <Input
                      id="city"
                      value={orgForm.headOffice}
                      onChange={(e) => setOrgForm({ ...orgForm, headOffice: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Support email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={orgForm.supportEmail}
                      onChange={(e) => setOrgForm({ ...orgForm, supportEmail: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cur">Base currency</Label>
                    <Input
                      id="cur"
                      value={orgForm.baseCurrency}
                      onChange={(e) => setOrgForm({ ...orgForm, baseCurrency: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <Button
                  className="rounded-xl gradient-warm text-primary-foreground font-medium"
                  disabled={updateOrgMutation.isPending}
                  onClick={() => updateOrgMutation.mutate()}
                >
                  {updateOrgMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="fees" className="mt-4">
          <div className="surface-card divide-y divide-border/70">
            {feeTemplates.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <Badge variant="secondary" className="mt-1 rounded-full text-[10px]">
                    {f.currency}
                  </Badge>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-display text-base font-semibold">
                    {money(f.amount, f.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="surface-card divide-y divide-border/70">
            <div className="flex items-center justify-between gap-4 p-4">
              <p className="min-w-0 text-sm">Email me when a new website lead arrives</p>
              <Switch
                checked={prefs?.newLeadEmail ?? true}
                onCheckedChange={(checked) =>
                  updatePrefsMutation.mutate({ newLeadEmail: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <p className="min-w-0 text-sm">Notify counsellors 3 days before a document deadline</p>
              <Switch
                checked={prefs?.deadlineReminder ?? true}
                onCheckedChange={(checked) =>
                  updatePrefsMutation.mutate({ deadlineReminder: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <p className="min-w-0 text-sm">Daily digest of pending payments</p>
              <Switch
                checked={prefs?.paymentDigest ?? true}
                onCheckedChange={(checked) =>
                  updatePrefsMutation.mutate({ paymentDigest: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-4">
              <p className="min-w-0 text-sm">Alert on visa decision updates</p>
              <Switch
                checked={prefs?.visaAlerts ?? true}
                onCheckedChange={(checked) =>
                  updatePrefsMutation.mutate({ visaAlerts: checked })
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
