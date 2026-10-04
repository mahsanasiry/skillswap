import { getDemoUserId } from "@/lib/session";
import type {
  ApiErrorBody,
  CreateFavoriteInput,
  CreateRequestInput,
  DashboardData,
  FavoriteView,
  Paginated,
  RequestBox,
  RequestStatus,
  Skill,
  SwapRequestView,
  UsersQuery,
  UserWithMatch,
} from "@/types";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
};

function buildUrl(path: string, query?: Options["query"]): string {
  const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL(`${BASE_PATH}/api${path}`, origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function request<T>(path: string, options: Options = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Demo-User-Id": getDemoUserId(),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "We could not reach the server.");
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      body?.error.code ?? "UNKNOWN",
      body?.error.message ?? "Something went wrong.",
      body?.error.fields,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  getUsers: (query: Partial<UsersQuery> = {}) =>
    request<Paginated<UserWithMatch>>("/users", { query }),
  getUser: (id: string) => request<UserWithMatch>(`/users/${id}`),
  getSkills: () => request<Skill[]>("/skills"),
  getSkill: (id: string) => request<Skill>(`/skills/${id}`),
  getRequests: (box: RequestBox = "all") =>
    request<SwapRequestView[]>("/requests", { query: { box } }),
  createRequest: (input: CreateRequestInput) =>
    request<SwapRequestView>("/requests", { method: "POST", body: input }),
  updateRequest: (id: string, status: Exclude<RequestStatus, "pending">) =>
    request<SwapRequestView>(`/requests/${id}`, { method: "PATCH", body: { status } }),
  getFavorites: () => request<FavoriteView[]>("/favorites"),
  addFavorite: (input: CreateFavoriteInput) =>
    request<FavoriteView>("/favorites", { method: "POST", body: input }),
  removeFavorite: (id: string) => request<void>(`/favorites/${id}`, { method: "DELETE" }),
  getDashboard: () => request<DashboardData>("/dashboard"),
  resetDemoData: () => request<void>("/reset", { method: "POST" }),
};
