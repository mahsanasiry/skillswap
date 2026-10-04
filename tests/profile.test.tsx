import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { ProfileView } from "@/components/profile/profile-view";
import { api } from "@/lib/api";
import { server } from "@/mocks/server";
import { setDemoUserId } from "@/lib/session";
import { renderWithProviders } from "./test-utils";

describe("ProfileView: content", () => {
  it("shows everything about the person", async () => {
    renderWithProviders(<ProfileView id="u3" />);
    expect(await screen.findByRole("heading", { level: 1, name: "Alex Rivera" })).toBeInTheDocument();
    expect(screen.getByText("Product Designer")).toBeInTheDocument();
    expect(screen.getByText("Madrid, Spain")).toBeInTheDocument();
    expect(screen.getByText(/with 9 years of experience/)).toBeInTheDocument();

    const facts = document.querySelector("dl") as HTMLElement;
    expect(within(facts).getByText("Expert")).toBeInTheDocument();
    expect(within(facts).getByText("9 years")).toBeInTheDocument();
    expect(within(facts).getByText("Flexible")).toBeInTheDocument();
    expect(within(facts).getByText("August 2025")).toBeInTheDocument();
  });

  it("lists skills they teach (with level) and skills they want", async () => {
    renderWithProviders(<ProfileView id="u3" />);
    const teaches = await screen.findByRole("region", { name: "Skills I teach" });
    await waitFor(() => expect(within(teaches).getByText("UI/UX · Expert")).toBeInTheDocument());
    expect(within(teaches).getByText("Figma · Advanced")).toBeInTheDocument();

    const wants = screen.getByRole("region", { name: "Skills I want to learn" });
    expect(await within(wants).findByText("React")).toBeInTheDocument();
    expect(within(wants).getByText("TypeScript")).toBeInTheDocument();
  });

  it("explains how you fit", async () => {
    renderWithProviders(<ProfileView id="u3" />);
    const fit = await screen.findByRole("region", { name: "How you fit" });
    expect(within(fit).getByText(/^Mutual match, \d+%$/)).toBeInTheDocument();
    await waitFor(() =>
      expect(within(fit).getByText(/Alex can teach you:/)).toHaveTextContent("UI/UX, Figma"),
    );
    expect(within(fit).getByText(/You can teach Alex:/)).toHaveTextContent("React");
    expect(within(fit).getByText(/Your schedules line up/)).toBeInTheDocument();
  });

  it("says so when there is nothing in common", async () => {
    renderWithProviders(<ProfileView id="u15" />); // Oliver, yoga
    const fit = await screen.findByRole("region", { name: "How you fit" });
    expect(within(fit).getByText("You have no skills in common right now.")).toBeInTheDocument();
  });

  it("links back to Discover", async () => {
    renderWithProviders(<ProfileView id="u3" />);
    expect(await screen.findByRole("link", { name: /Back to Discover/ })).toHaveAttribute("href", "/discover");
  });

  it("shows your own profile without action buttons", async () => {
    renderWithProviders(<ProfileView id="u1" />);
    expect(await screen.findByRole("heading", { level: 1, name: "Mahsa Nasiri" })).toBeInTheDocument();
    expect(screen.getByText("This is your profile.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request skill swap" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /favorite/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "How you fit" })).not.toBeInTheDocument();
  });
});

describe("ProfileView: loading and errors", () => {
  it("shows a loading state first", () => {
    renderWithProviders(<ProfileView id="u3" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading profile...");
  });

  it("says when the person does not exist", async () => {
    renderWithProviders(<ProfileView id="nobody" />);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We can't find this person.");
    expect(within(alert).queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows an error with a retry button when the server fails", async () => {
    window.localStorage.setItem("skillswap:simulate-error", "1");
    renderWithProviders(<ProfileView id="u3" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load this profile.");

    window.localStorage.removeItem("skillswap:simulate-error");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Alex Rivera" })).toBeInTheDocument();
  });
});

describe("ProfileView: favorites", () => {
  it("shows that a favorite is already a favorite, and removes it", async () => {
    renderWithProviders(<ProfileView id="u3" />); // f1 in the seed
    const remove = await screen.findByRole("button", { name: "Remove favorite" });
    await userEvent.click(remove);
    expect(await screen.findByRole("button", { name: "Add favorite" })).toBeInTheDocument();
    await waitFor(async () => {
      const names = (await api.getFavorites()).map((f) => f.user.name);
      expect(names).not.toContain("Alex Rivera");
    });
  });

  it("adds a favorite", async () => {
    renderWithProviders(<ProfileView id="u4" />); // Daniel, not a favorite yet
    await userEvent.click(await screen.findByRole("button", { name: "Add favorite" }));
    expect(await screen.findByRole("button", { name: "Remove favorite" })).toBeInTheDocument();
    await waitFor(async () => {
      const names = (await api.getFavorites()).map((f) => f.user.name);
      expect(names).toContain("Daniel Okafor");
    });
  });

  it("changes the heart straight away, before the server answers", async () => {
    server.use(http.post("*/api/favorites", async () => {
      await delay("infinite"); // the server never answers in this test
      return HttpResponse.json({});
    }));
    renderWithProviders(<ProfileView id="u4" />);
    await userEvent.click(await screen.findByRole("button", { name: "Add favorite" }));
    expect(await screen.findByRole("button", { name: "Remove favorite" })).toBeInTheDocument();
  });

  it("does not offer a wrong action while the favorites are still loading", async () => {
    renderWithProviders(<ProfileView id="u3" />); // already a favorite
    const early = await screen.findByRole("heading", { level: 1, name: "Alex Rivera" });
    expect(early).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add favorite" })).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Remove favorite" })).toBeInTheDocument();
  });

  it("goes back and shows a message if the server fails", async () => {
    renderWithProviders(<ProfileView id="u4" />);
    const button = await screen.findByRole("button", { name: "Add favorite" });
    window.localStorage.setItem("skillswap:simulate-error", "1");
    await userEvent.click(button);
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't update your favorites.");
    window.localStorage.removeItem("skillswap:simulate-error");
    await waitFor(() => expect(screen.getByRole("button", { name: "Add favorite" })).toBeEnabled());
  });

  it("keeps favorites separate for each demo user", async () => {
    setDemoUserId("u2"); // Sarah only favorites Alex
    renderWithProviders(<ProfileView id="u28" />);
    expect(await screen.findByRole("button", { name: "Add favorite" })).toBeInTheDocument();
  });
});

describe("ProfileView: requests", () => {
  it("opens and closes the request form", async () => {
    renderWithProviders(<ProfileView id="u28" />); // Nina: no pending request
    const button = await screen.findByRole("button", { name: "Request skill swap" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("heading", { name: "Request a skill swap with Nina Kowalski" })).toBeInTheDocument();
    await userEvent.click(button);
    expect(screen.queryByRole("heading", { name: /Request a skill swap/ })).not.toBeInTheDocument();
  });

  it("blocks a second request while one is pending, and explains why", async () => {
    renderWithProviders(<ProfileView id="u3" />); // Alex: r1 and r5 are pending
    const button = await screen.findByRole("button", { name: "Request skill swap" });
    await waitFor(() => expect(button).toBeDisabled());
    expect(screen.getByText(/You have a pending request with Alex Rivera/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See your requests" })).toHaveAttribute("href", "/requests");
  });

  it("enables the button again for someone with no pending request", async () => {
    renderWithProviders(<ProfileView id="u28" />);
    const button = await screen.findByRole("button", { name: "Request skill swap" });
    await waitFor(() => expect(screen.queryByText(/pending request/)).not.toBeInTheDocument());
    expect(button).toBeEnabled();
  });
});
