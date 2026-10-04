import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { FavoritesView } from "@/components/favorites/favorites-view";
import { users } from "@/data/users";
import { api } from "@/lib/api";
import { getMatch } from "@/lib/matching";
import { setDemoUserId } from "@/lib/session";
import { renderWithProviders } from "./test-utils";

async function ready() {
  renderWithProviders(<DashboardView />);
  await screen.findByRole("heading", { level: 1 });
}

const stat = (label: string) => screen.getByRole("link", { name: new RegExp(label) });

describe("Dashboard: summary", () => {
  it("shows a loading state first", () => {
    renderWithProviders(<DashboardView />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading dashboard...");
  });

  it("greets the person by first name", async () => {
    await ready();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome back, Mahsa");
  });

  it("shows the four numbers", async () => {
    await ready();
    const me = users[0];
    const mutual = users.filter((u) => u.id !== me.id && getMatch(me, u).mutual).length;

    expect(stat("Your skills")).toHaveTextContent("4");
    expect(stat("Potential matches")).toHaveTextContent(String(mutual));
    expect(mutual).toBeGreaterThan(0);
    expect(stat("Pending requests")).toHaveTextContent("3");
    expect(stat("Favorites")).toHaveTextContent("3");
  });

  it("links every number to the place where you can act on it", async () => {
    await ready();
    expect(stat("Your skills")).toHaveAttribute("href", "/profile/u1");
    expect(stat("Potential matches")).toHaveAttribute("href", "/discover");
    expect(stat("Pending requests")).toHaveAttribute("href", "/requests");
    expect(stat("Favorites")).toHaveAttribute("href", "/favorites");
  });

  it("shows each demo user their own dashboard", async () => {
    setDemoUserId("u3"); // Alex
    await ready();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome back, Alex");
    expect(stat("Pending requests")).toHaveTextContent("1"); // only Mahsa's request
    expect(stat("Favorites")).toHaveTextContent("0");
  });
});

describe("Dashboard: recent requests", () => {
  it("lists the five newest, newest first, with their status", async () => {
    await ready();
    const section = screen.getByRole("region", { name: "Recent requests" });
    const rows = within(section).getAllByRole("listitem");
    expect(rows).toHaveLength(5);

    const row = (i: number) => within(rows[i]);
    expect(row(0).getByText("Zoe Anderson")).toBeInTheDocument();
    expect(row(0).getByText("Pending")).toBeInTheDocument();
    expect(row(0).getByText(/Received from them/)).toBeInTheDocument();
    expect(row(1).getByText("Alex Rivera")).toBeInTheDocument();
    expect(row(1).getByText(/Sent to them/)).toBeInTheDocument();
    expect(row(4).getByText("Nina Kowalski")).toBeInTheDocument();
    expect(row(4).getByText("Accepted")).toBeInTheDocument();
  });

  it("links to each person and to all requests", async () => {
    await ready();
    const section = screen.getByRole("region", { name: "Recent requests" });
    expect(within(section).getByRole("link", { name: "Zoe Anderson" })).toHaveAttribute("href", "/profile/u30");
    expect(within(section).getByRole("link", { name: "View all requests" })).toHaveAttribute("href", "/requests");
  });

  it("reflects an answer straight away", async () => {
    await api.updateRequest("r3", "accepted"); // Zoe's request
    await ready();
    expect(stat("Pending requests")).toHaveTextContent("2");
    const section = screen.getByRole("region", { name: "Recent requests" });
    const first = within(section).getAllByRole("listitem")[0];
    expect(within(first).getByText("Accepted")).toBeInTheDocument();
  });

  it("explains when there are no requests", async () => {
    setDemoUserId("u2"); // Sarah has none
    await ready();
    const section = screen.getByRole("region", { name: "Recent requests" });
    expect(within(section).getByText("No requests yet.")).toBeInTheDocument();
    expect(within(section).getByRole("link", { name: "Find people" })).toHaveAttribute("href", "/discover");
  });
});

describe("Dashboard: best matches and errors", () => {
  it("suggests the three best matches", async () => {
    await ready();
    const section = screen.getByRole("region", { name: "Best matches for you" });
    await waitFor(() => expect(within(section).getAllByRole("article")).toHaveLength(3));
  });

  it("shows an error with a retry button when loading fails", async () => {
    window.localStorage.setItem("skillswap:simulate-error", "1");
    renderWithProviders(<DashboardView />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your dashboard.");

    window.localStorage.removeItem("skillswap:simulate-error");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Welcome back");
  });
});

describe("Dashboard: stays in step with the other pages", () => {
  it("updates the favorites number after removing someone on the Favorites page", async () => {
    // Both pages in one tree share one cache, like the real app does while you navigate.
    renderWithProviders(
      <>
        <DashboardView />
        <FavoritesView />
      </>,
    );
    await screen.findByRole("heading", { level: 1 });
    await waitFor(() => expect(screen.getAllByRole("article").length).toBeGreaterThan(3));
    expect(stat("Favorites")).toHaveTextContent("3");

    await userEvent.click(screen.getByRole("button", { name: "Remove Alex Rivera from favorites" }));
    await waitFor(() => expect(stat("Favorites")).toHaveTextContent("2"));
  });
});
