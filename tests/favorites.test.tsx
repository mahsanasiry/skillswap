import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { FavoritesView } from "@/components/favorites/favorites-view";
import { api } from "@/lib/api";
import { setDemoUserId } from "@/lib/session";
import { server } from "@/mocks/server";
import { renderWithProviders } from "./test-utils";

const cards = () => screen.queryAllByRole("article");
const names = () => cards().map((card) => within(card).getByRole("heading").textContent);
const card = (name: string) =>
  cards().find((c) => within(c).getByRole("heading").textContent === name) as HTMLElement;

async function ready() {
  renderWithProviders(<FavoritesView />);
  await waitFor(() => expect(cards().length).toBeGreaterThan(0));
}

describe("Favorites: list", () => {
  it("shows a loading state first", () => {
    renderWithProviders(<FavoritesView />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading favorites...");
  });

  it("lists the people you saved and says how many", async () => {
    await ready();
    expect(names()).toEqual(["Alex Rivera", "Nina Kowalski", "Carlos Mendes"]);
    expect(screen.getByText("3 people saved")).toBeInTheDocument();
  });

  it("shows the same card as Discover, with the match and a link to the profile", async () => {
    await ready();
    const alex = card("Alex Rivera");
    expect(within(alex).getByText("Product Designer")).toBeInTheDocument();
    expect(within(alex).getByText(/^Mutual match, \d+%$/)).toBeInTheDocument();
    expect(within(alex).getByRole("link", { name: "View Alex Rivera's profile" })).toHaveAttribute(
      "href",
      "/profile/u3",
    );
  });

  it("shows each demo user their own favorites", async () => {
    setDemoUserId("u2"); // Sarah only saved Alex
    await ready();
    expect(names()).toEqual(["Alex Rivera"]);
    expect(screen.getByText("1 person saved")).toBeInTheDocument();
  });
});

describe("Favorites: removing", () => {
  it("removes the card at once and says so", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Remove Alex Rivera from favorites" }));
    expect(names()).toEqual(["Nina Kowalski", "Carlos Mendes"]);
    expect(screen.getByText("Removed Alex Rivera from favorites.")).toBeInTheDocument();
  });

  it("removes it on the server too, and leaves the others alone", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Remove Nina Kowalski from favorites" }));
    await waitFor(async () => {
      const saved = (await api.getFavorites()).map((f) => f.user.name);
      expect(saved).toEqual(["Alex Rivera", "Carlos Mendes"]);
    });
    expect(names()).toEqual(["Alex Rivera", "Carlos Mendes"]);
  });

  it("changes the list before the server has answered", async () => {
    server.use(
      http.delete("*/api/favorites/:id", async () => {
        await delay("infinite"); // the server never answers in this test
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Remove Alex Rivera from favorites" }));
    expect(names()).not.toContain("Alex Rivera");
  });

  it("updates the count as people are removed", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Remove Alex Rivera from favorites" }));
    await userEvent.click(screen.getByRole("button", { name: "Remove Nina Kowalski from favorites" }));
    expect(await screen.findByText("Removed Nina Kowalski from favorites.")).toBeInTheDocument();
    expect(names()).toEqual(["Carlos Mendes"]);
  });

  it("shows a helpful empty state after the last one is removed", async () => {
    setDemoUserId("u2"); // one favorite
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Remove Alex Rivera from favorites" }));
    expect(await screen.findByText("No favorites yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find people" })).toHaveAttribute("href", "/discover");
    expect(cards()).toHaveLength(0);
  });

  it("puts the person back and explains if the server fails", async () => {
    await ready();
    window.localStorage.setItem("skillswap:simulate-error", "1");
    await userEvent.click(screen.getByRole("button", { name: "Remove Alex Rivera from favorites" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't remove that person.");
    expect(names()).toContain("Alex Rivera"); // the list stays visible and complete
    expect(screen.queryByText("Removed Alex Rivera from favorites.")).not.toBeInTheDocument();

    window.localStorage.removeItem("skillswap:simulate-error");
    await userEvent.click(screen.getByRole("button", { name: "Remove Alex Rivera from favorites" }));
    await waitFor(() => expect(names()).not.toContain("Alex Rivera"));
  });
});

describe("Favorites: empty and error states", () => {
  it("explains an empty list", async () => {
    setDemoUserId("u3"); // Alex has no favorites
    renderWithProviders(<FavoritesView />);
    expect(await screen.findByText("No favorites yet.")).toBeInTheDocument();
    expect(screen.getByText(/Use Add favorite on a profile/)).toBeInTheDocument();
  });

  it("shows an error with a retry button when loading fails", async () => {
    window.localStorage.setItem("skillswap:simulate-error", "1");
    renderWithProviders(<FavoritesView />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your favorites.");

    window.localStorage.removeItem("skillswap:simulate-error");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(cards()).toHaveLength(3));
  });
});
