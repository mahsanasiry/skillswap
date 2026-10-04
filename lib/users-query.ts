import type {
  Skill,
  UserSort,
  UsersQuery,
  UserWithMatch,
  Paginated,
} from "@/types";
import { AVAILABILITIES, CATEGORIES, LEVELS } from "@/lib/schemas";

export const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 50;

function pick<T extends readonly string[]>(
  value: string | null,
  allowed: T,
): T[number] | undefined {
  return value && (allowed as readonly string[]).includes(value) ? value : undefined;
}

function toInt(value: string | null, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Forgiving parser: bad values are ignored instead of throwing. */
export function parseUsersQuery(params: URLSearchParams): UsersQuery {
  return {
    q: params.get("q")?.trim() || undefined,
    skill: params.get("skill") || undefined,
    level: pick(params.get("level"), LEVELS),
    category: pick(params.get("category"), CATEGORIES),
    availability: pick(params.get("availability"), AVAILABILITIES),
    sort: pick(params.get("sort"), ["relevant", "experienced", "recent"] as const) ?? "relevant",
    page: toInt(params.get("page"), 1),
    pageSize: Math.min(toInt(params.get("pageSize"), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE),
  };
}

function matchesText(user: UserWithMatch, q: string, skillsById: Map<string, Skill>): boolean {
  const names = [
    user.name,
    user.role,
    user.location,
    // Only skills they teach: this page is for finding teachers.
    ...user.teaches.map((t) => skillsById.get(t.skillId)?.name ?? ""),
  ];
  const needle = q.toLowerCase();
  return names.some((text) => text.toLowerCase().includes(needle));
}

const sorters: Record<UserSort, (a: UserWithMatch, b: UserWithMatch) => number> = {
  relevant: (a, b) =>
    (b.match?.score ?? 0) - (a.match?.score ?? 0) ||
    b.yearsExperience - a.yearsExperience ||
    a.name.localeCompare(b.name),
  experienced: (a, b) => b.yearsExperience - a.yearsExperience || a.name.localeCompare(b.name),
  recent: (a, b) => b.joinedAt.localeCompare(a.joinedAt) || a.name.localeCompare(b.name),
};

export function queryUsers(
  all: UserWithMatch[],
  query: UsersQuery,
  skills: Skill[],
): Paginated<UserWithMatch> {
  const skillsById = new Map(skills.map((s) => [s.id, s]));

  const filtered = all
    .filter((user) => !query.q || matchesText(user, query.q, skillsById))
    .filter((user) => !query.skill || user.teaches.some((t) => t.skillId === query.skill))
    .filter((user) => !query.level || user.level === query.level)
    .filter(
      (user) =>
        !query.category ||
        user.teaches.some((t) => skillsById.get(t.skillId)?.category === query.category),
    )
    .filter((user) => !query.availability || user.availability === query.availability)
    .sort(sorters[query.sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;

  return {
    items: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page,
    pageSize: query.pageSize,
    totalPages,
  };
}

/**
 * The reverse of parseUsersQuery: turns filters into URL parameters.
 * Default values are left out so the address stays short and clean.
 */
export function buildUsersSearchParams(query: Partial<UsersQuery>): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.skill) params.set("skill", query.skill);
  if (query.level) params.set("level", query.level);
  if (query.category) params.set("category", query.category);
  if (query.availability) params.set("availability", query.availability);
  if (query.sort && query.sort !== "relevant") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
}
