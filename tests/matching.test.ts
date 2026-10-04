import { describe, expect, it } from "vitest";
import { users } from "@/data/users";
import { getMatch } from "@/lib/matching";
import type { User } from "@/types";

const byId = (id: string) => users.find((u) => u.id === id) as User;
const make = (overrides: Partial<User>): User => ({ ...byId("u1"), ...overrides });

describe("getMatch", () => {
  it("finds a mutual match (I teach React and want UI/UX, they do the opposite)", () => {
    const match = getMatch(byId("u1"), byId("u3")); // Mahsa and Alex
    expect(match.mutual).toBe(true);
    expect(match.theyTeachMe).toEqual(expect.arrayContaining(["uiux", "figma"]));
    expect(match.iTeachThem).toEqual(["react"]);
    expect(match.score).toBeGreaterThanOrEqual(90);
  });

  it("scores a one-way match lower than a mutual one", () => {
    // Grace teaches UI/UX (Mahsa wants it) and wants React (Mahsa teaches it): mutual.
    // Zoe wants React (Mahsa teaches it) but teaches nothing Mahsa wants: one-way.
    const mutual = getMatch(byId("u1"), byId("u24"));
    const oneWay = getMatch(byId("u1"), byId("u30"));
    expect(mutual.mutual).toBe(true);
    expect(oneWay.mutual).toBe(false);
    expect(oneWay.score).toBeGreaterThan(0);
    expect(mutual.score).toBeGreaterThan(oneWay.score);
  });

  it("scores a one-way match at 40 plus the availability bonus", () => {
    const me = make({ teaches: [{ skillId: "react", level: "advanced" }], wantsToLearn: ["uiux"], availability: "evenings" });
    const other = make({ id: "x", teaches: [{ skillId: "uiux", level: "advanced" }], wantsToLearn: ["cooking"], availability: "evenings" });
    const match = getMatch(me, other);
    expect(match.mutual).toBe(false);
    expect(match.score).toBe(50);
  });

  it("gives 0 when there is no overlap, even if availability fits", () => {
    const me = make({ teaches: [{ skillId: "react", level: "advanced" }], wantsToLearn: ["uiux"], availability: "flexible" });
    const other = make({ id: "x", teaches: [{ skillId: "yoga", level: "expert" }], wantsToLearn: ["cooking"], availability: "flexible" });
    expect(getMatch(me, other).score).toBe(0);
  });

  it("drops the availability bonus when schedules do not fit", () => {
    const me = make({ teaches: [{ skillId: "react", level: "advanced" }], wantsToLearn: ["uiux"], availability: "weekdays" });
    const other = make({ id: "x", teaches: [{ skillId: "uiux", level: "advanced" }], wantsToLearn: ["react"], availability: "weekends" });
    const match = getMatch(me, other);
    expect(match.availabilityFit).toBe(false);
    expect(match.score).toBe(80);
  });

  it("never exceeds 100", () => {
    const me = make({
      teaches: ["react", "nextjs", "typescript"].map((skillId) => ({ skillId, level: "expert" as const })),
      wantsToLearn: ["uiux", "figma", "drawing"],
      availability: "flexible",
    });
    const other = make({
      id: "x",
      teaches: ["uiux", "figma", "drawing"].map((skillId) => ({ skillId, level: "expert" as const })),
      wantsToLearn: ["react", "nextjs", "typescript"],
      availability: "flexible",
    });
    expect(getMatch(me, other).score).toBe(100);
  });
});
