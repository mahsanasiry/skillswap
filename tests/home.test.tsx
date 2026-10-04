import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import { navigation } from "./navigation";
import { renderWithProviders } from "./test-utils";

describe("home page", () => {
  it("shows the headline and the main sections", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Learn together. Share what you know.",
    );
    expect(screen.getByRole("heading", { name: "How SkillSwap works" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Skills people are teaching" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "People who fit you best" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find a match" })).toHaveAttribute("href", "/discover");
  });

  it("explains the three steps in order", () => {
    renderWithProviders(<HomePage />);
    const section = screen.getByRole("region", { name: "How SkillSwap works" });
    const steps = within(section).getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent("List what you know and what you want");
    expect(steps[1]).toHaveTextContent("Find people whose lists fit yours");
    expect(steps[2]).toHaveTextContent("Send a request and trade lessons");
  });

  it("shows loading placeholders, then the best matches", async () => {
    renderWithProviders(<HomePage />);
    const section = screen.getByRole("region", { name: "People who fit you best" });
    expect(within(section).queryAllByRole("article")).toHaveLength(0);
    await waitFor(() => expect(within(section).getAllByRole("article")).toHaveLength(3));
    // Mahsa's best matches are mutual
    expect(within(section).getAllByText(/^Mutual match/).length).toBeGreaterThan(0);
  });

  it("lists the skills with the most teachers", async () => {
    renderWithProviders(<HomePage />);
    const section = screen.getByRole("region", { name: "Skills people are teaching" });
    await waitFor(() => expect(within(section).getAllByRole("link").length).toBe(8));
    for (const link of within(section).getAllByRole("link")) {
      expect(link.getAttribute("href")).toMatch(/^\/discover\?skill=/);
    }
  });

  it("searches: sends the trimmed text to Discover", async () => {
    renderWithProviders(<HomePage />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Search skills" }), "  react native ");
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(navigation.push).toHaveBeenCalledWith("/discover?q=react%20native");
  });

  it("opens Discover without a query when the search is empty", async () => {
    renderWithProviders(<HomePage />);
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(navigation.push).toHaveBeenCalledWith("/discover");
  });

  it("offers popular skills as links", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole("link", { name: "React" })).toHaveAttribute("href", "/discover?skill=react");
  });

  it("shows an error with a retry button when the server fails", async () => {
    window.localStorage.setItem("skillswap:simulate-error", "1");
    renderWithProviders(<HomePage />);
    const section = screen.getByRole("region", { name: "People who fit you best" });
    const alert = await within(section).findByRole("alert");
    expect(alert).toHaveTextContent("We could not load the people.");

    window.localStorage.removeItem("skillswap:simulate-error");
    await userEvent.click(within(section).getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(within(section).getAllByRole("article")).toHaveLength(3));
  });

  it("changes the matches when another demo user is selected", async () => {
    window.localStorage.setItem("skillswap:demo-user", "u3"); // Alex
    renderWithProviders(<HomePage />);
    const section = screen.getByRole("region", { name: "People who fit you best" });
    await waitFor(() => expect(within(section).getAllByRole("article")).toHaveLength(3));
    // Alex is never shown to himself
    expect(within(section).queryByRole("heading", { name: "Alex Rivera" })).not.toBeInTheDocument();
  });
});
