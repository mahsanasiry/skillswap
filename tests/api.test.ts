import { beforeEach, describe, expect, it } from "vitest";
import { ApiError, api } from "@/lib/api";
import { setDemoUserId } from "@/lib/session";
import type { CreateRequestInput } from "@/types";

async function errorOf(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("Expected the request to fail");
}

beforeEach(() => setDemoUserId("u1")); // Mahsa

describe("users", () => {
  it("lists everyone except the current user, best matches first", async () => {
    const result = await api.getUsers({ pageSize: 50 });
    expect(result.total).toBe(29);
    expect(result.items.some((u) => u.id === "u1")).toBe(false);
    const scores = result.items.map((u) => u.match?.score ?? 0);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(result.items[0].match?.mutual).toBe(true);
  });

  it("searches by skill name, role and location (case-insensitive)", async () => {
    const bySkill = await api.getUsers({ q: "FIGMA", pageSize: 50 });
    expect(bySkill.items.length).toBeGreaterThan(0);
    const byRole = await api.getUsers({ q: "yoga instructor" });
    expect(byRole.items.map((u) => u.name)).toEqual(["Oliver Smith"]);
    const byPlace = await api.getUsers({ q: "madrid" });
    expect(byPlace.items.map((u) => u.name)).toEqual(["Alex Rivera"]);
  });

  it("returns an empty list (not an error) when nothing matches", async () => {
    const result = await api.getUsers({ q: "zzzz-no-such-skill" });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("filters by skill, level, category and availability", async () => {
    const teachesReact = await api.getUsers({ skill: "react", pageSize: 50 });
    expect(teachesReact.items.length).toBeGreaterThan(0);
    expect(teachesReact.items.every((u) => u.teaches.some((t) => t.skillId === "react"))).toBe(true);

    const experts = await api.getUsers({ level: "expert", pageSize: 50 });
    expect(experts.items.every((u) => u.level === "expert")).toBe(true);

    const music = await api.getUsers({ category: "Music", pageSize: 50 });
    expect(music.items.map((u) => u.name).sort()).toEqual(["Mei Lin", "Noah Williams"]);

    const weekends = await api.getUsers({ availability: "weekends", pageSize: 50 });
    expect(weekends.items.every((u) => u.availability === "weekends")).toBe(true);
  });

  it("combines filters", async () => {
    const result = await api.getUsers({ category: "Development", level: "expert", pageSize: 50 });
    expect(result.items.length).toBeGreaterThan(0);
    for (const u of result.items) expect(u.level).toBe("expert");
  });

  it("sorts by experience and by join date", async () => {
    const experienced = await api.getUsers({ sort: "experienced", pageSize: 50 });
    const years = experienced.items.map((u) => u.yearsExperience);
    expect(years).toEqual([...years].sort((a, b) => b - a));

    const recent = await api.getUsers({ sort: "recent", pageSize: 50 });
    const joined = recent.items.map((u) => u.joinedAt);
    expect(joined).toEqual([...joined].sort().reverse());
    expect(recent.items[0].name).toBe("Zoe Anderson");
  });

  it("paginates and clamps the page number", async () => {
    const first = await api.getUsers({ page: 1, pageSize: 10 });
    expect(first.items).toHaveLength(10);
    expect(first.totalPages).toBe(3);
    const last = await api.getUsers({ page: 3, pageSize: 10 });
    expect(last.items).toHaveLength(9);
    const beyond = await api.getUsers({ page: 99, pageSize: 10 });
    expect(beyond.page).toBe(3);
  });

  it("gets one user with a match, and returns 404 for unknown ids", async () => {
    const alex = await api.getUser("u3");
    expect(alex.name).toBe("Alex Rivera");
    expect(alex.match?.mutual).toBe(true);

    const self = await api.getUser("u1");
    expect(self.match).toBeNull();

    const error = await errorOf(api.getUser("nope"));
    expect(error.status).toBe(404);
  });

  it("computes matches from the point of view of the selected demo user", async () => {
    setDemoUserId("u3"); // Alex
    const mahsa = await api.getUser("u1");
    expect(mahsa.match?.mutual).toBe(true);
    expect(mahsa.match?.iTeachThem).toEqual(expect.arrayContaining(["uiux", "figma"]));
  });
});

describe("skills", () => {
  it("lists and fetches skills", async () => {
    const all = await api.getSkills();
    expect(all).toHaveLength(27);
    expect((await api.getSkill("react")).name).toBe("React");
    expect((await errorOf(api.getSkill("nope"))).status).toBe(404);
  });
});

describe("requests", () => {
  const valid: CreateRequestInput = {
    receiverId: "u19",
    teachSkillId: "javascript",
    learnSkillId: "react",
    message: "I would love to swap with you.",
  };

  it("filters the boxes for the current user", async () => {
    const received = await api.getRequests("received");
    expect(received.map((r) => r.id).sort()).toEqual(["r1", "r2", "r3"]);
    expect(received.every((r) => r.receiver.id === "u1")).toBe(true);

    const sent = await api.getRequests("sent");
    expect(sent.map((r) => r.id).sort()).toEqual(["r4", "r5", "r6"]);

    const accepted = await api.getRequests("accepted");
    expect(accepted.map((r) => r.id)).toEqual(["r4"]);

    const all = await api.getRequests();
    expect(all).toHaveLength(6);
  });

  it("includes readable names for people and skills", async () => {
    const [first] = await api.getRequests("received");
    expect(first.sender.name).toBeTruthy();
    expect(first.teachSkill.name).toBeTruthy();
    expect(first.learnSkill.name).toBeTruthy();
  });

  it("creates a pending request", async () => {
    const created = await api.createRequest(valid);
    expect(created.status).toBe("pending");
    expect(created.sender.id).toBe("u1");
    const sent = await api.getRequests("sent");
    expect(sent.some((r) => r.id === created.id)).toBe(true);
  });

  it("reports every invalid field at once", async () => {
    const error = await errorOf(
      api.createRequest({ receiverId: "u19", teachSkillId: "", learnSkillId: "", message: "" }),
    );
    expect(error.status).toBe(400);
    expect(error.fields).toMatchObject({
      teachSkillId: "Choose a skill you can teach",
      learnSkillId: "Choose a skill you want to learn",
      message: "Write a short message",
    });
  });

  it("rejects a message that is too short", async () => {
    const error = await errorOf(api.createRequest({ ...valid, message: "hi" }));
    expect(error.fields?.message).toBe("Write at least 10 characters");
  });

  it("rejects skills that do not belong to the right person", async () => {
    const notMine = await errorOf(api.createRequest({ ...valid, teachSkillId: "yoga" }));
    expect(notMine.fields?.teachSkillId).toBeTruthy();
    const notTheirs = await errorOf(api.createRequest({ ...valid, learnSkillId: "yoga" }));
    expect(notTheirs.fields?.learnSkillId).toBeTruthy();
  });

  it("rejects requests to yourself and to unknown people", async () => {
    expect((await errorOf(api.createRequest({ ...valid, receiverId: "u1" }))).status).toBe(400);
    expect((await errorOf(api.createRequest({ ...valid, receiverId: "nope" }))).status).toBe(404);
  });

  it("blocks a second pending request with the same person", async () => {
    await api.createRequest(valid);
    const error = await errorOf(api.createRequest(valid));
    expect(error.status).toBe(409);
    expect(error.code).toBe("DUPLICATE_REQUEST");
  });

  it("lets the receiver accept, and the change shows in the other boxes", async () => {
    const accepted = await api.updateRequest("r1", "accepted");
    expect(accepted.status).toBe("accepted");
    expect((await api.getRequests("accepted")).map((r) => r.id).sort()).toEqual(["r1", "r4"]);
  });

  it("lets the receiver reject", async () => {
    expect((await api.updateRequest("r2", "rejected")).status).toBe("rejected");
  });

  it("lets only the sender cancel", async () => {
    const forbidden = await errorOf(api.updateRequest("r1", "cancelled")); // u1 is the receiver
    expect(forbidden.status).toBe(403);
    expect((await api.updateRequest("r5", "cancelled")).status).toBe("cancelled");
  });

  it("stops the sender from accepting their own request", async () => {
    expect((await errorOf(api.updateRequest("r5", "accepted"))).status).toBe(403);
  });

  it("stops answering a request twice", async () => {
    await api.updateRequest("r1", "accepted");
    const error = await errorOf(api.updateRequest("r1", "rejected"));
    expect(error.status).toBe(409);
  });

  it("returns 404 for unknown requests", async () => {
    expect((await errorOf(api.updateRequest("nope", "accepted"))).status).toBe(404);
  });

  it("keeps changes after a reload but restores the seed on reset", async () => {
    await api.updateRequest("r1", "accepted");
    expect((await api.getRequests("received")).find((r) => r.id === "r1")?.status).toBe("accepted");
    await api.resetDemoData();
    expect((await api.getRequests("received")).find((r) => r.id === "r1")?.status).toBe("pending");
  });
});

describe("favorites", () => {
  it("lists the current user's favorites with their profiles", async () => {
    const favorites = await api.getFavorites();
    expect(favorites.map((f) => f.user.name).sort()).toEqual(["Alex Rivera", "Carlos Mendes", "Nina Kowalski"]);
  });

  it("adds a favorite, and adding it again does not duplicate", async () => {
    const first = await api.addFavorite({ targetUserId: "u4" });
    const second = await api.addFavorite({ targetUserId: "u4" });
    expect(second.id).toBe(first.id);
    expect(await api.getFavorites()).toHaveLength(4);
  });

  it("removes a favorite", async () => {
    await api.removeFavorite("f1");
    const names = (await api.getFavorites()).map((f) => f.user.name);
    expect(names).not.toContain("Alex Rivera");
  });

  it("cannot remove someone else's favorite", async () => {
    const error = await errorOf(api.removeFavorite("f4")); // belongs to u2
    expect(error.status).toBe(404);
  });

  it("validates who can be favorited", async () => {
    expect((await errorOf(api.addFavorite({ targetUserId: "u1" }))).status).toBe(400);
    expect((await errorOf(api.addFavorite({ targetUserId: "nope" }))).status).toBe(404);
  });
});

describe("dashboard", () => {
  it("summarises the current user's activity", async () => {
    const data = await api.getDashboard();
    expect(data.user.name).toBe("Mahsa Nasiri");
    expect(data.skillsCount).toBe(4);
    expect(data.pendingRequests).toBe(3);
    expect(data.favorites).toBe(3);
    expect(data.potentialMatches).toBeGreaterThan(0);
    expect(data.recentRequests.length).toBeLessThanOrEqual(5);
  });

  it("changes when a request is answered", async () => {
    await api.updateRequest("r1", "accepted");
    expect((await api.getDashboard()).pendingRequests).toBe(2);
  });
});

describe("error handling", () => {
  it("fails with a clear error when the simulated outage flag is on", async () => {
    window.localStorage.setItem("skillswap:simulate-error", "1");
    const error = await errorOf(api.getUsers());
    expect(error.status).toBe(500);
    expect(error.message).toBeTruthy();
  });
});
