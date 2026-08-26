import { useState } from "react";
import { Bell, Moon, Plus, Search, Settings, Sun, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

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
import { useApp } from "@/lib/context/app-context";

export function TopBar() {
  const [dark, setDark] = useState(false);
  const { user, activeBranchId, setActiveBranchId, signOut } = useApp();

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const userInitials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const branches = user?.branches || [];

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="shrink-0" />
          <Select
            value={activeBranchId}
            onValueChange={(val) => {
              setActiveBranchId(val);
              const branchName =
                val === "all" ? "All branches" : branches.find((b) => b.id === val)?.name || val;
              toast.info(`Switched to ${branchName}`);
            }}
          >
            <SelectTrigger className="hidden h-9 w-[190px] rounded-xl bg-card sm:flex text-xs font-medium">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {user?.isSuperAdmin && <SelectItem value="all">All Branches</SelectItem>}
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
          <Link to="/students">
            <Button
              size="sm"
              className="hidden rounded-xl gradient-warm text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-92 sm:inline-flex"
            >
              <Plus className="size-4" /> Quick Add
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            onClick={() => toast("Notifications", { description: "No new unread alerts" })}
          >
            <Bell className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleTheme}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Link to="/settings">
            <Button variant="ghost" size="icon" className="hidden rounded-xl md:inline-flex">
              <Settings className="size-4" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-0.5 rounded-full ring-offset-background transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="size-9 border border-border">
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel>
                <p className="text-sm font-semibold">{user?.name || "Staff Member"}</p>
                <p className="text-xs font-normal text-muted-foreground capitalize">
                  {user?.role?.replace("_", " ") || "Staff"}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 size-4" /> Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={signOut}
              >
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
