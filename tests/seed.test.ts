import { describe, expect, it } from "vitest";
import { seedFavorites, seedRequests } from "@/data/seed";
import { skills } from "@/data/skills";
import { DEMO_USER_IDS, users } from "@/data/users";
import { favoriteSchema, skillSchema, swapRequestSchema, userSchema } from "@/lib/schemas";

const skillIds = new Set(skills.map((s) => s.id));
const userById = new Map(users.map((u) => [u.id, u]));

describe("seed data", () => {
  it("has the expected size and unique ids", () => {
    expect(users).toHaveLength(30);
    expect(new Set(users.map((u) => u.id)).size).toBe(30);
    expect(new Set(users.map((u) => u.username)).size).toBe(30);
    expect(new Set(skills.map((s) => s.id)).size).toBe(skills.length);
  });

  it("matches the schemas", () => {
    for (const s of skills) expect(skillSchema.safeParse(s).success).toBe(true);
    for (const u of users) expect(userSchema.safeParse(u).success).toBe(true);
    for (const r of seedRequests) expect(swapRequestSchema.safeParse(r).success).toBe(true);
    for (const f of seedFavorites) expect(favoriteSchema.safeParse(f).success).toBe(true);
  });

  it("only references skills that exist", () => {
    for (const user of users) {
      for (const t of user.teaches) expect(skillIds.has(t.skillId), `${user.name}: ${t.skillId}`).toBe(true);
      for (const id of user.wantsToLearn) expect(skillIds.has(id), `${user.name}: ${id}`).toBe(true);
    }
  });

  it("never lists the same skill as both taught and wanted", () => {
    for (const user of users) {
      const taught = user.teaches.map((t) => t.skillId);
      expect(user.wantsToLearn.filter((id) => taught.includes(id)), user.name).toEqual([]);
    }
  });

  it("has requests that follow the business rules", () => {
    for (const r of seedRequests) {
      const sender = userById.get(r.senderId);
      const receiver = userById.get(r.receiverId);
      expect(sender, r.id).toBeDefined();
      expect(receiver, r.id).toBeDefined();
      expect(sender!.id).not.toBe(receiver!.id);
      expect(sender!.teaches.some((t) => t.skillId === r.teachSkillId), `${r.id} teach`).toBe(true);
      expect(receiver!.teaches.some((t) => t.skillId === r.learnSkillId), `${r.id} learn`).toBe(true);
    }
  });

  it("has favorites pointing at real, different people", () => {
    for (const f of seedFavorites) {
      expect(userById.has(f.userId)).toBe(true);
      expect(userById.has(f.targetUserId)).toBe(true);
      expect(f.userId).not.toBe(f.targetUserId);
    }
  });

  it("has valid demo users", () => {
    for (const id of DEMO_USER_IDS) expect(userById.has(id)).toBe(true);
  });
});
