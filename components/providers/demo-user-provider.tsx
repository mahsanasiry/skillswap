"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEMO_USER_IDS, users } from "@/data/users";
import { getDemoUserId, setDemoUserId } from "@/lib/session";
import type { User } from "@/types";

type DemoUserContextValue = {
  user: User;
  demoUsers: User[];
  switchUser: (id: string) => void;
};

const DemoUserContext = createContext<DemoUserContextValue | null>(null);

const demoUsers = DEMO_USER_IDS.map((id) => users.find((u) => u.id === id) as User);

/**
 * Holds "who is logged in". There is no real authentication: the person picks
 * one of a few demo users. Query keys include the user id, so switching users
 * automatically shows that user's data.
 */
export function DemoUserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState(getDemoUserId);

  const switchUser = useCallback((id: string) => {
    setDemoUserId(id); // first, so the API client sends the new id
    setUserId(id);
  }, []);

  const value = useMemo<DemoUserContextValue>(
    () => ({
      user: demoUsers.find((u) => u.id === userId) ?? demoUsers[0],
      demoUsers,
      switchUser,
    }),
    [userId, switchUser],
  );

  return <DemoUserContext.Provider value={value}>{children}</DemoUserContext.Provider>;
}

export function useDemoUser() {
  const context = useContext(DemoUserContext);
  if (!context) throw new Error("useDemoUser must be used inside DemoUserProvider");
  return context;
}
