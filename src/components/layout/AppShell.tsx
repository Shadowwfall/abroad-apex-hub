import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-background">
          <TopBar />
          <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-7">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
