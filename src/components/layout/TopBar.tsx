import { useState } from "react";
import { Bell, Moon, Plus, Search, Settings, Sun } from "lucide-react";
import { toast } from "sonner";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { branches } from "@/data/crm";

export function TopBar() {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="shrink-0" />
          <Select defaultValue={branches[0]?.id ?? ""}>
            <SelectTrigger className="hidden h-9 w-[190px] rounded-xl bg-card sm:flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search students, leads, applications…"
            className="h-9 w-full rounded-xl bg-card pl-9"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            size="sm"
            className="hidden rounded-xl gradient-warm text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-92 sm:inline-flex"
            onClick={() => toast.success("Quick add", { description: "Choose a record type to create." })}
          >
            <Plus className="size-4" /> Quick Add
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            onClick={() => toast("3 new notifications")}
          >
            <Bell className="size-4" />
            <Badge className="absolute -right-0.5 -top-0.5 size-4 justify-center rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
              3
            </Badge>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleTheme}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="hidden rounded-xl md:inline-flex">
            <Settings className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-0.5 rounded-full ring-offset-background transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="size-9 border border-border">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                    AK
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">Anil Kumar</p>
                <p className="text-xs font-normal text-muted-foreground">Super Admin</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
