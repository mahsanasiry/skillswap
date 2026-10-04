import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Navbar } from "@/components/layout/navbar";
import { getDemoUserId } from "@/lib/session";
import { navigation } from "./navigation";
import { renderWithProviders } from "./test-utils";

describe("Navbar", () => {
  it("has the main links", () => {
    renderWithProviders(<Navbar />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const name of ["Discover", "Dashboard", "Requests", "Favorites"]) {
      expect(within(nav).getByRole("link", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "SkillSwap" })).toHaveAttribute("href", "/");
  });

  it("marks the current page", () => {
    navigation.pathname = "/discover/";
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("marks a parent page while on a child page", () => {
    navigation.pathname = "/profile/u3";
    renderWithProviders(<Navbar />);
    expect(screen.queryByRole("link", { current: "page" })).not.toBeInTheDocument();
  });

  it("opens and closes the mobile menu", async () => {
    renderWithProviders(<Navbar />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(screen.getByRole("link", { name: "Requests" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("switches between light and dark mode and remembers the choice", async () => {
    renderWithProviders(<Navbar />);
    await userEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("skillswap:theme")).toBe("dark");
    await userEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("starts in the theme that was set before first paint", () => {
    document.documentElement.dataset.theme = "dark";
    renderWithProviders(<Navbar />);
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("lets you view the app as another demo user", async () => {
    renderWithProviders(<Navbar />);
    const select = screen.getByRole("combobox", { name: "Viewing as" });
    expect(select).toHaveValue("u1");
    await userEvent.selectOptions(select, "u3");
    expect(select).toHaveValue("u3");
    expect(getDemoUserId()).toBe("u3");
  });
});
