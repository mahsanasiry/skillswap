"use client";

import { useDemoUser } from "@/hooks/use-demo-user";

/** Real login is out of scope, so this lets you view the app as another person. */
export function DemoUserSwitcher() {
  const { user, demoUsers, switchUser } = useDemoUser();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="demo-user" className="text-sm text-ink-soft">
        Viewing as
      </label>
      <select
        id="demo-user"
        value={user.id}
        onChange={(event) => switchUser(event.target.value)}
        className="h-11 rounded-lg border border-line bg-surface px-3 text-ink"
      >
        {demoUsers.map((demoUser) => (
          <option key={demoUser.id} value={demoUser.id}>
            {demoUser.name}
          </option>
        ))}
      </select>
    </div>
  );
}
