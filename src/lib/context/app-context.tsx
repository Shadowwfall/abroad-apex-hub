import React, { createContext, useContext, useState, useEffect } from "react";
import type { AuthUser } from "../auth";
import { getSupabaseBrowserClient } from "../supabase/client";
import { toast } from "sonner";

type AppContextType = {
  user: AuthUser | null;
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [activeBranchId, setActiveBranchId] = useState<string>("all");

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const signOut = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      setUser(null);
      toast.success("Signed out successfully");
      window.location.href = "/login";
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign out";
      toast.error(message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeBranchId,
        setActiveBranchId,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContextProvider");
  }
  return context;
}
