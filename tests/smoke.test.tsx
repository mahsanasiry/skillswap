import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("home page", () => {
  it("shows the heading and loads data from the mock API", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <HomePage />
      </QueryClientProvider>,
    );
    expect(screen.getByRole("heading", { name: "SkillSwap" })).toBeInTheDocument();
    // 30 seeded people minus the logged-in demo user
    expect(await screen.findByText(/29 people and 27 skills/)).toBeInTheDocument();
  });
});
