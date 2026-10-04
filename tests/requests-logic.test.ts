import { describe, expect, it } from "vitest";
import { api } from "@/lib/api";
import { describeRequest, formatShortDate, sortRequests, splitRequests, statusLine } from "@/lib/requests";

async function load() {
  return api.getRequests("all"); // Mahsa (u1) by default
}

describe("splitRequests", () => {
  it("puts requests in the right tab", async () => {
    const boxes = splitRequests(await load(), "u1");
    expect(boxes.received.map((r) => r.id).sort()).toEqual(["r1", "r2", "r3"]);
    expect(boxes.sent.map((r) => r.id).sort()).toEqual(["r4", "r5", "r6"]);
    expect(boxes.accepted.map((r) => r.id)).toEqual(["r4"]);
  });

  it("ignores requests between other people", async () => {
    const boxes = splitRequests(await load(), "u1");
    const all = [...boxes.received, ...boxes.sent].map((r) => r.id);
    expect(all).not.toContain("r7");
  });

  it("includes accepted requests in both directions", async () => {
    await api.updateRequest("r1", "accepted"); // I am the receiver
    const boxes = splitRequests(await load(), "u1");
    expect(boxes.accepted.map((r) => r.id).sort()).toEqual(["r1", "r4"]);
  });
});

describe("sortRequests", () => {
  it("shows waiting requests first, newest first", async () => {
    const boxes = splitRequests(await load(), "u1");
    expect(boxes.received.map((r) => r.id)).toEqual(["r3", "r2", "r1"]);
    expect(boxes.sent.map((r) => r.id)).toEqual(["r5", "r4", "r6"]); // pending, accepted (newer), rejected
  });

  it("does not change the list it was given", async () => {
    const original = await load();
    const copy = [...original];
    sortRequests(original);
    expect(original).toEqual(copy);
  });
});

describe("describeRequest", () => {
  it("describes a received request from the sender's point of view", async () => {
    const r3 = (await load()).find((r) => r.id === "r3")!; // Zoe: teaches Git, wants React
    expect(describeRequest(r3, "u1", "received")).toBe("Zoe wants to learn React and can teach Git.");
  });

  it("describes a sent request in the first person", async () => {
    const r5 = (await load()).find((r) => r.id === "r5")!; // me to Alex: teach React, learn Figma
    expect(describeRequest(r5, "u1", "sent")).toBe(
      "You want to learn Figma from Alex and can teach React.",
    );
  });

  it("describes an accepted swap in both directions", async () => {
    const all = await load();
    const r4 = all.find((r) => r.id === "r4")!; // I sent it: teach React, learn UI/UX
    expect(describeRequest(r4, "u1", "accepted")).toBe("You teach React and learn UI/UX.");
    // The same request, as seen by the person who received it
    expect(describeRequest(r4, "u28", "accepted")).toBe("You teach UI/UX and learn React.");
  });
});

describe("dates", () => {
  it("formats dates in UTC", () => {
    expect(formatShortDate("2026-09-28T10:00:00.000Z")).toBe("Sep 28, 2026");
    expect(formatShortDate("2026-01-01T00:30:00.000Z")).toBe("Jan 1, 2026");
  });

  it("writes a status line that fits the status", async () => {
    const all = await load();
    expect(statusLine(all.find((r) => r.id === "r3")!)).toBe("Sent on Oct 2, 2026");
    expect(statusLine(all.find((r) => r.id === "r4")!)).toBe("Accepted on Sep 21, 2026");
    expect(statusLine(all.find((r) => r.id === "r6")!)).toBe("Rejected on Sep 16, 2026");
  });
});
