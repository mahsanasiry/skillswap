import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Suspense } from "react";
import { describe, expect, it } from "vitest";
import { RequestsView } from "@/components/requests/requests-view";
import { api } from "@/lib/api";
import { server } from "@/mocks/server";
import { setDemoUserId } from "@/lib/session";
import { navigation } from "./navigation";
import { renderWithProviders } from "./test-utils";

function renderRequests(search = "") {
  navigation.pathname = "/requests/";
  navigation.setSearch(search);
  return renderWithProviders(
    <Suspense fallback={null}>
      <RequestsView />
    </Suspense>,
  );
}

const cards = () => screen.queryAllByRole("article");
const names = () => cards().map((card) => within(card).getByRole("heading").textContent);
const card = (name: string) =>
  cards().find((c) => within(c).getByRole("heading").textContent === name) as HTMLElement;
const tab = (name: RegExp | string) => screen.getByRole("tab", { name });
const lastReplace = () => navigation.replace.mock.calls.at(-1)?.[0] as string;

async function ready(search = "") {
  renderRequests(search);
  await screen.findByRole("tablist", { name: "Requests" });
}

describe("Requests: tabs", () => {
  it("shows a loading state first", () => {
    renderRequests();
    expect(screen.getByRole("status")).toHaveTextContent("Loading requests...");
  });

  it("has three tabs with counts, and Received is selected by default", async () => {
    await ready();
    expect(tab(/^Received/)).toHaveTextContent("3");
    expect(tab(/^Sent/)).toHaveTextContent("3");
    expect(tab(/^Accepted/)).toHaveTextContent("1");
    expect(tab(/^Received/)).toHaveAttribute("aria-selected", "true");
    expect(tab(/^Sent/)).toHaveAttribute("aria-selected", "false");
  });

  it("connects each tab to its panel", async () => {
    await ready();
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAccessibleName(/Received/);
    expect(tab(/^Received/)).toHaveAttribute("aria-controls", panel.id);
  });

  it("switches tabs and writes the choice in the address", async () => {
    await ready();
    await userEvent.click(tab(/^Sent/));
    expect(lastReplace()).toBe("/requests/?tab=sent");
    await waitFor(() => expect(tab(/^Sent/)).toHaveAttribute("aria-selected", "true"));
    expect(names().sort()).toEqual(["Alex Rivera", "Grace Okoye", "Nina Kowalski"]);

    await userEvent.click(tab(/^Received/));
    expect(lastReplace()).toBe("/requests/");
  });

  it("opens the tab named in the address", async () => {
    await ready("tab=accepted");
    expect(tab(/^Accepted/)).toHaveAttribute("aria-selected", "true");
    expect(names()).toEqual(["Nina Kowalski"]);
  });

  it("falls back to Received for an unknown tab", async () => {
    await ready("tab=banana");
    expect(tab(/^Received/)).toHaveAttribute("aria-selected", "true");
  });

  it("moves between tabs with the arrow keys, Home and End", async () => {
    await ready();
    tab(/^Received/).focus();
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(tab(/^Sent/)).toHaveAttribute("aria-selected", "true"));
    expect(tab(/^Sent/)).toHaveFocus();

    await userEvent.keyboard("{End}");
    await waitFor(() => expect(tab(/^Accepted/)).toHaveAttribute("aria-selected", "true"));
    await userEvent.keyboard("{ArrowRight}"); // wraps around
    await waitFor(() => expect(tab(/^Received/)).toHaveAttribute("aria-selected", "true"));
    await userEvent.keyboard("{ArrowLeft}"); // wraps the other way
    await waitFor(() => expect(tab(/^Accepted/)).toHaveAttribute("aria-selected", "true"));
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(tab(/^Received/)).toHaveAttribute("aria-selected", "true"));
  });

  it("only the selected tab is reachable with the Tab key", async () => {
    await ready();
    expect(tab(/^Received/)).toHaveAttribute("tabindex", "0");
    expect(tab(/^Sent/)).toHaveAttribute("tabindex", "-1");
  });
});

describe("Requests: received", () => {
  it("lists requests with the waiting ones first and says how many wait", async () => {
    await ready();
    expect(names()).toEqual(["Zoe Anderson", "Daniel Okafor", "Alex Rivera"]);
    expect(screen.getByText("3 requests are waiting for your answer.")).toBeInTheDocument();
  });

  it("explains each request in a sentence, with the message and date", async () => {
    await ready();
    const zoe = card("Zoe Anderson");
    expect(within(zoe).getByText("Zoe wants to learn React and can teach Git.")).toBeInTheDocument();
    expect(within(zoe).getByText(/I'm new to React and could use help/)).toBeInTheDocument();
    expect(within(zoe).getByText("Sent on Oct 2, 2026")).toBeInTheDocument();
    expect(within(zoe).getByText("Pending")).toBeInTheDocument();
    expect(within(zoe).getByText("Junior Developer")).toBeInTheDocument();
  });

  it("links the name to the profile", async () => {
    await ready();
    expect(within(card("Alex Rivera")).getByRole("link", { name: "Alex Rivera" })).toHaveAttribute(
      "href",
      "/profile/u3",
    );
  });

  it("offers Accept and Reject on waiting requests only", async () => {
    await ready();
    expect(screen.getAllByRole("button", { name: /^Accept request from/ })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /^Reject request from/ })).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /Cancel/ })).not.toBeInTheDocument();
  });
});

describe("Requests: accepting and rejecting", () => {
  it("accepting updates the card, the counts and the Accepted tab at once", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Accept request from Alex Rivera" }));

    const alex = card("Alex Rivera");
    expect(within(alex).getByText("Accepted")).toBeInTheDocument();
    expect(within(alex).queryByRole("button", { name: /Accept|Reject/ })).not.toBeInTheDocument();
    expect(tab(/^Accepted/)).toHaveTextContent("2");
    expect(screen.getByText("2 requests are waiting for your answer.")).toBeInTheDocument();

    await userEvent.click(tab(/^Accepted/));
    await waitFor(() => expect(names().sort()).toEqual(["Alex Rivera", "Nina Kowalski"]));
  });

  it("changes the card before the server has answered", async () => {
    server.use(
      http.patch("*/api/requests/:id", async () => {
        await delay("infinite"); // the server never answers in this test
        return HttpResponse.json({});
      }),
    );
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Accept request from Alex Rivera" }));
    expect(within(card("Alex Rivera")).getByText("Accepted")).toBeInTheDocument();
    expect(screen.getByText("Accepted the request from Alex Rivera.")).toBeInTheDocument();
    expect(tab(/^Accepted/)).toHaveTextContent("2");
  });

  it("saves the answer on the server", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Accept request from Alex Rivera" }));
    await waitFor(async () => {
      const r1 = (await api.getRequests("received")).find((r) => r.id === "r1");
      expect(r1?.status).toBe("accepted");
    });
  });

  it("rejecting marks the request and keeps it out of Accepted", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Reject request from Daniel Okafor" }));
    expect(within(card("Daniel Okafor")).getByText("Rejected")).toBeInTheDocument();
    expect(tab(/^Accepted/)).toHaveTextContent("1");
    expect(screen.getByText("2 requests are waiting for your answer.")).toBeInTheDocument();
  });

  it("moves an answered request below the ones still waiting", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Accept request from Zoe Anderson" }));
    expect(names()).toEqual(["Daniel Okafor", "Alex Rivera", "Zoe Anderson"]);
  });

  it("uses the singular when one request is left, and a calm message when none are", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Reject request from Zoe Anderson" }));
    await userEvent.click(screen.getByRole("button", { name: "Reject request from Daniel Okafor" }));
    expect(screen.getByText("1 request is waiting for your answer.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reject request from Alex Rivera" }));
    expect(screen.getByText("You have no requests waiting for an answer.")).toBeInTheDocument();
  });

  it("announces the action to screen readers", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Accept request from Alex Rivera" }));
    expect(screen.getByText("Accepted the request from Alex Rivera.")).toBeInTheDocument();
  });

  it("keeps the answer after the data is fetched again", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Accept request from Alex Rivera" }));
    await waitFor(async () => expect((await api.getRequests("received")).find((r) => r.id === "r1")?.status).toBe("accepted"));
    expect(within(card("Alex Rivera")).getByText("Accepted")).toBeInTheDocument();
  });
});

describe("Requests: sent", () => {
  it("describes sent requests in the first person and lets you cancel pending ones", async () => {
    await ready("tab=sent");
    expect(names()).toEqual(["Alex Rivera", "Nina Kowalski", "Grace Okoye"]);
    const alex = card("Alex Rivera");
    expect(within(alex).getByText("You want to learn Figma from Alex and can teach React.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Cancel request to/ })).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /^Accept/ })).not.toBeInTheDocument();
  });

  it("shows how answered requests ended", async () => {
    await ready("tab=sent");
    expect(within(card("Nina Kowalski")).getByText("Accepted")).toBeInTheDocument();
    expect(within(card("Grace Okoye")).getByText("Rejected")).toBeInTheDocument();
    expect(within(card("Grace Okoye")).getByText("Rejected on Sep 16, 2026")).toBeInTheDocument();
  });

  it("cancelling marks the request as cancelled right away", async () => {
    await ready("tab=sent");
    await userEvent.click(screen.getByRole("button", { name: "Cancel request to Alex Rivera" }));
    expect(within(card("Alex Rivera")).getByText("Cancelled")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Cancel request/ })).not.toBeInTheDocument();
    await waitFor(async () =>
      expect((await api.getRequests("sent")).find((r) => r.id === "r5")?.status).toBe("cancelled"),
    );
  });

  it("shows a request that was just sent from a profile", async () => {
    await api.createRequest({
      receiverId: "u19",
      teachSkillId: "javascript",
      learnSkillId: "react",
      message: "A brand new request for Carlos.",
    });
    await ready("tab=sent");
    expect(names()[0]).toBe("Carlos Mendes");
    expect(tab(/^Sent/)).toHaveTextContent("4");
  });
});

describe("Requests: accepted tab", () => {
  it("describes the swap you agreed on", async () => {
    await ready("tab=accepted");
    const nina = card("Nina Kowalski");
    expect(within(nina).getByText("You teach React and learn UI/UX.")).toBeInTheDocument();
    expect(within(nina).getByText("Accepted on Sep 21, 2026")).toBeInTheDocument();
    expect(within(nina).queryByRole("button")).not.toBeInTheDocument();
  });

  it("describes a swap you accepted from the other side", async () => {
    await api.updateRequest("r1", "accepted"); // Alex taught UI/UX and wants React
    await ready("tab=accepted");
    expect(
      within(card("Alex Rivera")).getByText("You teach React and learn UI/UX."),
    ).toBeInTheDocument();
  });
});

describe("Requests: empty states", () => {
  it("explains an empty Received tab", async () => {
    setDemoUserId("u2"); // Sarah has no requests
    await ready();
    expect(await screen.findByText("No requests yet.")).toBeInTheDocument();
    expect(screen.getByText(/their request shows up here/)).toBeInTheDocument();
    expect(screen.queryByText(/waiting for your answer/)).not.toBeInTheDocument();
  });

  it("offers a way forward when nothing was sent", async () => {
    setDemoUserId("u2");
    await ready("tab=sent");
    expect(await screen.findByText("You haven't sent any requests.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find people" })).toHaveAttribute("href", "/discover");
  });

  it("explains an empty Accepted tab", async () => {
    setDemoUserId("u2");
    await ready("tab=accepted");
    expect(await screen.findByText("No accepted swaps yet.")).toBeInTheDocument();
  });

  it("shows each demo user their own requests", async () => {
    setDemoUserId("u3"); // Alex: received r5, sent r1 and r7
    await ready();
    expect(names()).toEqual(["Mahsa Nasiri"]);
    await userEvent.click(tab(/^Sent/));
    await waitFor(() => expect(names().sort()).toEqual(["Carlos Mendes", "Mahsa Nasiri"]));
  });
});

describe("Requests: when things go wrong", () => {
  it("shows an error with a retry button when loading fails", async () => {
    window.localStorage.setItem("skillswap:simulate-error", "1");
    renderRequests();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We couldn't load your requests.");

    window.localStorage.removeItem("skillswap:simulate-error");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("tablist", { name: "Requests" })).toBeInTheDocument();
  });

  it("puts the request back and explains if the server fails", async () => {
    await ready();
    window.localStorage.setItem("skillswap:simulate-error", "1");
    await userEvent.click(screen.getByRole("button", { name: "Accept request from Alex Rivera" }));

    const alex = card("Alex Rivera");
    expect(await within(alex).findByRole("alert")).toHaveTextContent("The server is not responding.");
    expect(within(alex).getByText("Pending")).toBeInTheDocument();
    expect(within(alex).getByRole("button", { name: "Accept request from Alex Rivera" })).toBeEnabled();
    expect(tab(/^Accepted/)).toHaveTextContent("1");

    window.localStorage.removeItem("skillswap:simulate-error");
    await userEvent.click(within(alex).getByRole("button", { name: "Accept request from Alex Rivera" }));
    await waitFor(() => expect(within(card("Alex Rivera")).getByText("Accepted")).toBeInTheDocument());
  });

  it("explains it when the request was already answered somewhere else", async () => {
    await ready();
    await api.updateRequest("r1", "accepted"); // answered in another tab
    await userEvent.click(screen.getByRole("button", { name: "Reject request from Alex Rivera" }));

    expect(await within(card("Alex Rivera")).findByRole("alert")).toHaveTextContent(
      "This request has already been answered.",
    );
    // after the data refreshes, the card shows what really happened
    await waitFor(() => expect(within(card("Alex Rivera")).getByText("Accepted")).toBeInTheDocument());
  });

  it("only disables the buttons of the request being updated", async () => {
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Accept request from Alex Rivera" }));
    // other cards stay usable
    expect(screen.getByRole("button", { name: "Accept request from Zoe Anderson" })).toBeEnabled();
  });
});
