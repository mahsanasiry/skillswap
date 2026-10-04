import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Suspense } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { DiscoverView } from "@/components/discover/discover-view";
import { navigation } from "./navigation";
import { renderWithProviders } from "./test-utils";

function renderDiscover(search = "") {
  navigation.pathname = "/discover/";
  navigation.setSearch(search);
  return renderWithProviders(
    <Suspense fallback={null}>
      <DiscoverView />
    </Suspense>,
  );
}

const cards = () => screen.queryAllByRole("article");
const cardNames = () => cards().map((card) => within(card).getByRole("heading").textContent);
const lastReplace = () => navigation.replace.mock.calls.at(-1)?.[0] as string;

async function waitForResults() {
  await waitFor(() => expect(cards().length).toBeGreaterThan(0));
}

beforeEach(() => navigation.setSearch(""));

describe("Discover: loading and results", () => {
  it("shows placeholders first, then the first page of people", async () => {
    renderDiscover();
    expect(screen.getByRole("status")).toHaveTextContent("Loading people...");
    await waitFor(() => expect(cards()).toHaveLength(9));
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1 to 9 of 29 people");
  });

  it("puts mutual matches first", async () => {
    renderDiscover();
    await waitForResults();
    const first = cards()[0];
    expect(within(first).getByText(/^Mutual match/)).toBeInTheDocument();
  });

  it("never lists the signed-in demo user", async () => {
    renderDiscover("pageSize=50");
    await waitForResults();
    expect(cardNames()).not.toContain("Mahsa Nasiri");
  });
});

describe("Discover: filters read from the address", () => {
  it("applies filters from the URL and shows them in the controls", async () => {
    renderDiscover("level=expert&category=Music");
    await waitFor(() => expect(cards()).toHaveLength(2));
    expect(cardNames().sort()).toEqual(["Mei Lin", "Noah Williams"]);
    expect(screen.getByLabelText("Level")).toHaveValue("expert");
    expect(screen.getByLabelText("Category")).toHaveValue("Music");
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1 to 2 of 2 people");
  });

  it("applies a skill from a link on the home page", async () => {
    renderDiscover("skill=yoga");
    await waitFor(() => expect(cards()).toHaveLength(1));
    expect(cardNames()).toEqual(["Oliver Smith"]);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1 person");
    expect(await screen.findByRole("option", { name: "Yoga" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Skill they teach")).toHaveValue("yoga"));
  });

  it("applies a search from a link on the home page", async () => {
    renderDiscover("q=madrid");
    await waitFor(() => expect(cardNames()).toEqual(["Alex Rivera"]));
    expect(screen.getByRole("searchbox", { name: "Search people or skills" })).toHaveValue("madrid");
  });
});

describe("Discover: changing filters", () => {
  it("search waits a moment, then updates the address and the results", async () => {
    renderDiscover();
    await waitForResults();
    await userEvent.type(screen.getByRole("searchbox", { name: "Search people or skills" }), "yoga");
    expect(navigation.replace).not.toHaveBeenCalled(); // still waiting
    await waitFor(() => expect(lastReplace()).toBe("/discover/?q=yoga"));
    await waitFor(() => expect(cardNames()).toEqual(["Oliver Smith"]));
  });

  it("pressing Enter searches immediately", async () => {
    renderDiscover();
    await waitForResults();
    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search people or skills" }),
      "figma{Enter}",
    );
    expect(lastReplace()).toBe("/discover/?q=figma");
  });

  it("search is case-insensitive and matches roles and places", async () => {
    renderDiscover("q=PRODUCT%20DESIGNER");
    await waitFor(() => expect(cardNames()).toEqual(["Alex Rivera"]));
  });

  it("changing a select updates the address", async () => {
    renderDiscover();
    await waitForResults();
    await userEvent.selectOptions(screen.getByLabelText("Level"), "expert");
    expect(lastReplace()).toBe("/discover/?level=expert");
    await waitFor(() =>
      expect(screen.getByRole("status")).not.toHaveTextContent("of 29 people"),
    );
  });

  it("combines several filters and keeps earlier ones", async () => {
    renderDiscover("level=expert");
    await waitForResults();
    await userEvent.selectOptions(screen.getByLabelText("Availability"), "weekends");
    expect(lastReplace()).toBe("/discover/?level=expert&availability=weekends");
    await waitFor(() => expect(cards().length).toBeGreaterThan(0));
    for (const card of cards()) {
      expect(within(card).getByRole("heading")).toBeInTheDocument();
    }
  });

  it("sorts by recently joined", async () => {
    renderDiscover();
    await waitForResults();
    await userEvent.selectOptions(screen.getByLabelText("Sort by"), "recent");
    expect(lastReplace()).toBe("/discover/?sort=recent");
    await waitFor(() => expect(cardNames()[0]).toBe("Zoe Anderson"));
  });

  it("sorts by most experienced", async () => {
    renderDiscover("sort=experienced");
    await waitFor(() => expect(cardNames()[0]).toBe("Noah Williams"));
    expect(screen.getByLabelText("Sort by")).toHaveValue("experienced");
  });

  it("goes back to the default sort without cluttering the address", async () => {
    renderDiscover("sort=recent");
    await waitForResults();
    await userEvent.selectOptions(screen.getByLabelText("Sort by"), "relevant");
    expect(lastReplace()).toBe("/discover/");
  });
});

describe("Discover: pagination", () => {
  it("moves between pages and updates the address", async () => {
    renderDiscover();
    await waitFor(() => expect(cards()).toHaveLength(9));
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(within(nav).getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");

    await userEvent.click(within(nav).getByRole("button", { name: "Next" }));
    expect(lastReplace()).toBe("/discover/?page=2");
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Showing 10 to 18 of 29 people"),
    );
    expect(within(nav).getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("shows the short last page and disables Next", async () => {
    renderDiscover("page=4");
    await waitFor(() => expect(cards()).toHaveLength(2));
    expect(screen.getByRole("status")).toHaveTextContent("Showing 28 to 29 of 29 people");
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("jumps straight to a page number", async () => {
    renderDiscover();
    await waitForResults();
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(lastReplace()).toBe("/discover/?page=3");
  });

  it("returns to page 1 when a filter changes", async () => {
    renderDiscover("page=3");
    await waitFor(() => expect(cards().length).toBeGreaterThan(0));
    await userEvent.selectOptions(screen.getByLabelText("Level"), "expert");
    expect(lastReplace()).toBe("/discover/?level=expert");
  });

  it("hides pagination when everything fits on one page", async () => {
    renderDiscover("level=beginner");
    await waitFor(() => expect(cardNames()).toEqual(["Zoe Anderson"]));
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
  });
});

describe("Discover: empty, clear and error states", () => {
  it("explains when nothing matches and lets you clear the filters", async () => {
    renderDiscover("q=zzzz");
    expect(await screen.findByText("No matches found.")).toBeInTheDocument();
    expect(screen.getByText("Try another skill.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No people found");

    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(lastReplace()).toBe("/discover/");
    await waitFor(() => expect(cards()).toHaveLength(9));
    expect(screen.getByRole("searchbox", { name: "Search people or skills" })).toHaveValue("");
  });

  it("shows how many filters are active and clears them all", async () => {
    renderDiscover("q=react&level=expert&category=Development");
    await waitForResults();
    const clear = screen.getAllByRole("button", { name: "Clear filters (3)" })[0];
    await userEvent.click(clear);
    expect(lastReplace()).toBe("/discover/");
    await waitFor(() => expect(cards()).toHaveLength(9));
    expect(screen.queryByRole("button", { name: /Clear filters/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Level")).toHaveValue("");
  });

  it("does not show a clear button when no filter is active", async () => {
    renderDiscover();
    await waitForResults();
    expect(screen.queryByRole("button", { name: /Clear filters/ })).not.toBeInTheDocument();
  });

  it("shows an error with a retry button, then recovers", async () => {
    window.localStorage.setItem("skillswap:simulate-error", "1");
    renderDiscover();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn't load the people.");
    expect(cards()).toHaveLength(0);

    window.localStorage.removeItem("skillswap:simulate-error");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(cards()).toHaveLength(9));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("Discover: controls", () => {
  it("every control has a visible label", async () => {
    renderDiscover();
    await waitForResults();
    for (const label of [
      "Search people or skills",
      "Skill they teach",
      "Level",
      "Category",
      "Availability",
      "Sort by",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("offers every skill in the skill filter", async () => {
    renderDiscover();
    expect(await screen.findByRole("option", { name: "React" })).toBeInTheDocument();
    const select = screen.getByLabelText("Skill they teach");
    expect(within(select).getAllByRole("option")).toHaveLength(28); // 27 skills + "Any skill"
  });

  it("toggles the filter panel on small screens", async () => {
    renderDiscover();
    await waitForResults();
    const toggle = screen.getByRole("button", { name: "Show filters" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Hide filters" })).toHaveAttribute("aria-expanded", "true");
  });

  it("shows different people to a different demo user", async () => {
    window.localStorage.setItem("skillswap:demo-user", "u3"); // Alex
    renderDiscover("pageSize=50");
    await waitForResults();
    expect(cardNames()).toContain("Mahsa Nasiri");
    expect(cardNames()).not.toContain("Alex Rivera");
  });
});
