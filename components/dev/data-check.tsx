"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Temporary: proves the mock API works. Replaced by the real home page in step 3. */
export function DataCheck() {
  const users = useQuery({ queryKey: ["users", "check"], queryFn: () => api.getUsers() });
  const skills = useQuery({ queryKey: ["skills"], queryFn: api.getSkills });

  if (users.isPending || skills.isPending) {
    return <p className="text-ink-soft">Loading data...</p>;
  }
  if (users.isError || skills.isError) {
    return (
      <div role="alert">
        <p>Something went wrong. We could not load the data.</p>
        <button
          className="mt-2 rounded border border-line px-3 py-1"
          onClick={() => {
            void users.refetch();
            void skills.refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <p className="text-ink-soft">
      Mock API is working: {users.data.total} people and {skills.data.length} skills loaded.
    </p>
  );
}
