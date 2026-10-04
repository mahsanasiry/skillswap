import { delay, http, HttpResponse } from "msw";
import { skills } from "@/data/skills";
import { DEFAULT_DEMO_USER_ID, users } from "@/data/users";
import { isErrorSimulated, newId, readDb, resetDb, writeDb } from "@/lib/db";
import { getMatch } from "@/lib/matching";
import {
  createFavoriteSchema,
  createRequestSchema,
  updateRequestSchema,
} from "@/lib/schemas";
import { parseUsersQuery, queryUsers } from "@/lib/users-query";
import type {
  ApiErrorBody,
  DashboardData,
  FavoriteView,
  RequestBox,
  SwapRequest,
  SwapRequestView,
  User,
  UserWithMatch,
} from "@/types";

/**
 * A mock REST API. These handlers answer real fetch() calls inside the browser,
 * so the app is written exactly as if a server existed.
 */

const usersById = new Map(users.map((u) => [u.id, u]));
const skillsById = new Map(skills.map((s) => [s.id, s]));

function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  const body: ApiErrorBody = { error: { code, message, fields } };
  return HttpResponse.json(body, { status });
}

function currentUser(request: Request): User {
  const id = request.headers.get("x-demo-user-id") ?? DEFAULT_DEMO_USER_ID;
  return usersById.get(id) ?? (usersById.get(DEFAULT_DEMO_USER_ID) as User);
}

function withMatch(me: User, other: User): UserWithMatch {
  return { ...other, match: other.id === me.id ? null : getMatch(me, other) };
}

function toView(r: SwapRequest): SwapRequestView {
  return {
    ...r,
    sender: usersById.get(r.senderId) as User,
    receiver: usersById.get(r.receiverId) as User,
    teachSkill: skillsById.get(r.teachSkillId)!,
    learnSkill: skillsById.get(r.learnSkillId)!,
  };
}

function byNewest(a: SwapRequest, b: SwapRequest) {
  return b.updatedAt.localeCompare(a.updatedAt);
}

export const handlers = [
  // Simulated outage (for demonstrating error states). Applies to everything.
  http.all("*/api/*", async ({ request }) => {
    if (isErrorSimulated() && !request.url.endsWith("/api/reset")) {
      await delay(300);
      return errorResponse(500, "SIMULATED_ERROR", "The server is not responding.");
    }
    // Returning nothing lets the request continue to the next matching handler.
  }),

  // ---- Users ----
  http.get("*/api/users", async ({ request }) => {
    await delay();
    const me = currentUser(request);
    const query = parseUsersQuery(new URL(request.url).searchParams);
    const others = users.filter((u) => u.id !== me.id).map((u) => withMatch(me, u));
    return HttpResponse.json(queryUsers(others, query, skills));
  }),

  http.get("*/api/users/:id", async ({ request, params }) => {
    await delay();
    const user = usersById.get(String(params.id));
    if (!user) return errorResponse(404, "NOT_FOUND", "This person does not exist.");
    return HttpResponse.json(withMatch(currentUser(request), user));
  }),

  // ---- Skills ----
  http.get("*/api/skills", async () => {
    await delay();
    return HttpResponse.json(skills);
  }),

  http.get("*/api/skills/:id", async ({ params }) => {
    await delay();
    const skill = skillsById.get(String(params.id));
    if (!skill) return errorResponse(404, "NOT_FOUND", "This skill does not exist.");
    return HttpResponse.json(skill);
  }),

  // ---- Requests ----
  http.get("*/api/requests", async ({ request }) => {
    await delay();
    const me = currentUser(request);
    const box = (new URL(request.url).searchParams.get("box") ?? "all") as RequestBox;
    const mine = readDb().requests.filter((r) => r.senderId === me.id || r.receiverId === me.id);
    const filtered = mine.filter((r) => {
      if (box === "received") return r.receiverId === me.id;
      if (box === "sent") return r.senderId === me.id;
      if (box === "accepted") return r.status === "accepted";
      return true;
    });
    return HttpResponse.json(filtered.sort(byNewest).map(toView));
  }),

  http.post("*/api/requests", async ({ request }) => {
    await delay();
    const me = currentUser(request);
    const parsed = createRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        fields[key] ??= issue.message;
      }
      return errorResponse(400, "VALIDATION_ERROR", "Some fields need attention.", fields);
    }
    const input = parsed.data;
    const receiver = usersById.get(input.receiverId);
    if (!receiver) return errorResponse(404, "NOT_FOUND", "This person does not exist.");
    if (receiver.id === me.id) {
      return errorResponse(400, "INVALID_REQUEST", "You cannot send a request to yourself.");
    }
    if (!me.teaches.some((t) => t.skillId === input.teachSkillId)) {
      return errorResponse(400, "VALIDATION_ERROR", "Some fields need attention.", {
        teachSkillId: "Pick one of the skills you teach",
      });
    }
    if (!receiver.teaches.some((t) => t.skillId === input.learnSkillId)) {
      return errorResponse(400, "VALIDATION_ERROR", "Some fields need attention.", {
        learnSkillId: `${receiver.name} does not teach this skill`,
      });
    }

    const db = readDb();
    const duplicate = db.requests.some(
      (r) =>
        r.status === "pending" &&
        ((r.senderId === me.id && r.receiverId === receiver.id) ||
          (r.senderId === receiver.id && r.receiverId === me.id)),
    );
    if (duplicate) {
      return errorResponse(
        409,
        "DUPLICATE_REQUEST",
        `You already have a pending request with ${receiver.name}.`,
      );
    }

    const now = new Date().toISOString();
    const created: SwapRequest = {
      id: newId("r"),
      senderId: me.id,
      receiverId: receiver.id,
      teachSkillId: input.teachSkillId,
      learnSkillId: input.learnSkillId,
      message: input.message,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    writeDb({ ...db, requests: [created, ...db.requests] });
    return HttpResponse.json(toView(created), { status: 201 });
  }),

  http.patch("*/api/requests/:id", async ({ request, params }) => {
    await delay();
    const me = currentUser(request);
    const parsed = updateRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Status must be accepted, rejected or cancelled.");
    }
    const db = readDb();
    const target = db.requests.find((r) => r.id === params.id);
    if (!target) return errorResponse(404, "NOT_FOUND", "This request does not exist.");

    const { status } = parsed.data;
    const allowed =
      status === "cancelled" ? target.senderId === me.id : target.receiverId === me.id;
    if (!allowed) {
      return errorResponse(403, "FORBIDDEN", "You cannot change this request.");
    }
    if (target.status !== "pending") {
      return errorResponse(409, "NOT_PENDING", "This request has already been answered.");
    }

    const updated: SwapRequest = { ...target, status, updatedAt: new Date().toISOString() };
    writeDb({ ...db, requests: db.requests.map((r) => (r.id === updated.id ? updated : r)) });
    return HttpResponse.json(toView(updated));
  }),

  // ---- Favorites ----
  http.get("*/api/favorites", async ({ request }) => {
    await delay();
    const me = currentUser(request);
    const views: FavoriteView[] = readDb()
      .favorites.filter((f) => f.userId === me.id)
      .map((f) => ({ ...f, user: usersById.get(f.targetUserId) as User }));
    return HttpResponse.json(views);
  }),

  http.post("*/api/favorites", async ({ request }) => {
    await delay();
    const me = currentUser(request);
    const parsed = createFavoriteSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return errorResponse(400, "VALIDATION_ERROR", "targetUserId is required.");
    const target = usersById.get(parsed.data.targetUserId);
    if (!target) return errorResponse(404, "NOT_FOUND", "This person does not exist.");
    if (target.id === me.id) {
      return errorResponse(400, "INVALID_REQUEST", "You cannot favorite yourself.");
    }

    const db = readDb();
    const existing = db.favorites.find((f) => f.userId === me.id && f.targetUserId === target.id);
    if (existing) return HttpResponse.json({ ...existing, user: target }, { status: 200 });

    const created = { id: newId("f"), userId: me.id, targetUserId: target.id };
    writeDb({ ...db, favorites: [...db.favorites, created] });
    return HttpResponse.json({ ...created, user: target }, { status: 201 });
  }),

  http.delete("*/api/favorites/:id", async ({ request, params }) => {
    await delay();
    const me = currentUser(request);
    const db = readDb();
    const target = db.favorites.find((f) => f.id === params.id && f.userId === me.id);
    if (!target) return errorResponse(404, "NOT_FOUND", "This favorite does not exist.");
    writeDb({ ...db, favorites: db.favorites.filter((f) => f.id !== target.id) });
    return new HttpResponse(null, { status: 204 });
  }),

  // ---- Dashboard (extra endpoint, makes the home screen one request) ----
  http.get("*/api/dashboard", async ({ request }) => {
    await delay();
    const me = currentUser(request);
    const db = readDb();
    const mine = db.requests.filter((r) => r.senderId === me.id || r.receiverId === me.id);
    const data: DashboardData = {
      user: me,
      skillsCount: me.teaches.length + me.wantsToLearn.length,
      potentialMatches: users.filter((u) => u.id !== me.id && getMatch(me, u).mutual).length,
      pendingRequests: mine.filter((r) => r.receiverId === me.id && r.status === "pending").length,
      favorites: db.favorites.filter((f) => f.userId === me.id).length,
      recentRequests: mine.sort(byNewest).slice(0, 5).map(toView),
    };
    return HttpResponse.json(data);
  }),

  // ---- Demo helper ----
  http.post("*/api/reset", async () => {
    await delay();
    resetDb();
    return new HttpResponse(null, { status: 204 });
  }),
];
