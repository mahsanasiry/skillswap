import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import DashboardPage from "@/app/dashboard/page";
import DiscoverPage from "@/app/discover/page";
import FavoritesPage from "@/app/favorites/page";
import HomePage from "@/app/page";
import ProfilePage from "@/app/profile/[id]/page";
import RequestsPage from "@/app/requests/page";
import NotFound from "@/app/not-found";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SkipLink } from "@/components/layout/skip-link";
import { users } from "@/data/users";
import { setDemoUserId } from "@/lib/session";
import { navigation } from "./navigation";
import { renderWithProviders } from "./test-utils";

/**
 * Final audit. Every REAL page component is rendered inside the real layout pieces,
 * then checked for broken links and for accessibility problems.
 */

// ---------- which routes exist? Read them from the app folder, never from memory.
function routesFromAppFolder(): RegExp[] {
  const root = path.join(process.cwd(), "app");
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name));
      else if (entry.name === "page.tsx") found.push(path.relative(root, dir));
    }
  };
  walk(root);
  return found.map((dir) => {
    const segments = dir === "" ? [] : dir.split(path.sep);
    const pattern = segments.map((s) => (s.startsWith("[") ? "[^/]+" : s)).join("/");
    return new RegExp(`^/${pattern}$`);
  });
}

const routes = routesFromAppFolder();
const userIds = new Set(users.map((u) => u.id));

function brokenLinks(): string[] {
  const broken: string[] = [];
  for (const anchor of document.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href") ?? "";
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    if (href.startsWith("#")) {
      if (!document.getElementById(href.slice(1))) broken.push(`${href} (no element with that id)`);
      continue;
    }
    const pathname = new URL(href, "http://site").pathname.replace(/\/$/, "") || "/";
    const exists = routes.some((r) => r.test(pathname));
    const profileOk = !pathname.startsWith("/profile/") || userIds.has(pathname.split("/")[2]);
    if (!exists || !profileOk) broken.push(href);
  }
  return broken;
}

// ---------- accessibility
async function violations(): Promise<string[]> {
  const result = await axe.run(document.body, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
    // jsdom does not paint, so axe cannot measure colour. Contrast is checked in contrast.test.ts.
    rules: { "color-contrast": { enabled: false } },
  });
  return result.violations.map(
    (v) => `${v.id}: ${v.help}\n    ${v.nodes.map((n) => n.target.join(" ")).join("\n    ")}`,
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

async function idle() {
  await waitFor(() => expect(document.querySelector('[aria-busy="true"]')).toBeNull());
  await waitFor(() => expect(screen.queryByText(/^Loading/)).not.toBeInTheDocument());
}

type Scenario = { name: string; setup: () => Promise<void> };

const scenarios: Scenario[] = [
  {
    name: "home",
    setup: async () => {
      renderWithProviders(<Shell><HomePage /></Shell>);
      await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(3));
      await idle();
    },
  },
  {
    name: "discover",
    setup: async () => {
      navigation.pathname = "/discover/";
      renderWithProviders(<Shell><DiscoverPage /></Shell>);
      await waitFor(() => expect(screen.getAllByRole("article").length).toBeGreaterThan(0));
      await idle();
    },
  },
  {
    name: "discover with no results",
    setup: async () => {
      navigation.pathname = "/discover/";
      navigation.setSearch("q=zzzz");
      renderWithProviders(<Shell><DiscoverPage /></Shell>);
      await screen.findByText("No matches found.");
    },
  },
  {
    name: "discover when the server fails",
    setup: async () => {
      window.localStorage.setItem("skillswap:simulate-error", "1");
      navigation.pathname = "/discover/";
      renderWithProviders(<Shell><DiscoverPage /></Shell>);
      await screen.findByRole("alert");
    },
  },
  {
    name: "profile of someone else",
    setup: async () => {
      renderWithProviders(<Shell>{await ProfilePage({ params: Promise.resolve({ id: "u3" }) })}</Shell>);
      await screen.findByRole("heading", { level: 1, name: "Alex Rivera" });
      await idle();
    },
  },
  {
    name: "profile with the request form open and errors showing",
    setup: async () => {
      renderWithProviders(<Shell>{await ProfilePage({ params: Promise.resolve({ id: "u28" }) })}</Shell>);
      await userEvent.click(await screen.findByRole("button", { name: "Request skill swap" }));
      const message = await screen.findByLabelText("Message");
      await userEvent.clear(message);
      await userEvent.click(screen.getByRole("button", { name: "Send request" }));
      await screen.findByText("Write a short message");
    },
  },
  {
    name: "my own profile",
    setup: async () => {
      renderWithProviders(<Shell>{await ProfilePage({ params: Promise.resolve({ id: "u1" }) })}</Shell>);
      await screen.findByText("This is your profile.");
    },
  },
  {
    name: "requests, received tab",
    setup: async () => {
      navigation.pathname = "/requests/";
      renderWithProviders(<Shell><RequestsPage /></Shell>);
      await screen.findByRole("tablist", { name: "Requests" });
    },
  },
  {
    name: "requests, sent tab",
    setup: async () => {
      navigation.pathname = "/requests/";
      navigation.setSearch("tab=sent");
      renderWithProviders(<Shell><RequestsPage /></Shell>);
      await screen.findByRole("tablist", { name: "Requests" });
    },
  },
  {
    name: "requests, empty",
    setup: async () => {
      setDemoUserId("u2");
      navigation.pathname = "/requests/";
      renderWithProviders(<Shell><RequestsPage /></Shell>);
      await screen.findByText("No requests yet.");
    },
  },
  {
    name: "favorites",
    setup: async () => {
      navigation.pathname = "/favorites/";
      renderWithProviders(<Shell><FavoritesPage /></Shell>);
      await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(3));
    },
  },
  {
    name: "favorites, empty",
    setup: async () => {
      setDemoUserId("u3");
      renderWithProviders(<Shell><FavoritesPage /></Shell>);
      await screen.findByText("No favorites yet.");
    },
  },
  {
    name: "dashboard",
    setup: async () => {
      navigation.pathname = "/dashboard/";
      renderWithProviders(<Shell><DashboardPage /></Shell>);
      await screen.findByRole("heading", { level: 1 });
      await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(3));
      await idle();
    },
  },
  {
    name: "page not found",
    setup: async () => {
      renderWithProviders(<Shell><NotFound /></Shell>);
      await screen.findByRole("heading", { name: "Page not found" });
    },
  },
];

describe.each(scenarios)("audit: $name", ({ setup }) => {
  it("has no broken links", { timeout: 30_000 }, async () => {
    await setup();
    expect(brokenLinks()).toEqual([]);
  });

  it("has no accessibility violations", { timeout: 30_000 }, async () => {
    await setup();
    expect(await violations()).toEqual([]);
  });

  it("has exactly one main area, one h1 and a working skip link", { timeout: 30_000 }, async () => {
    await setup();
    expect(document.querySelectorAll("main")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(document.getElementById("main")?.tagName).toBe("MAIN");
  });
});

describe("audit: the link checker itself", () => {
  it("really does find a broken link (so a pass means something)", () => {
    // Plain HTML on purpose: these are the mistakes the checker must catch.
    document.body.innerHTML = `
      <a href="/profile/u3">fine</a>
      <a href="/profile/u999">no such person</a>
      <a href="/pricing">no such page</a>
      <a href="#nowhere">no such anchor</a>
      <a href="https://example.com">external</a>`;
    expect(brokenLinks()).toEqual(["/profile/u999", "/pricing", "#nowhere (no element with that id)"]);
  });

  it("really does find an accessibility problem (so a pass means something)", async () => {
    document.body.innerHTML = `<button></button><img src="x.png"><input>`;
    const found = (await violations()).map((v) => v.split(":")[0]);
    expect(found).toEqual(expect.arrayContaining(["button-name", "image-alt", "label"]));
  });
});
