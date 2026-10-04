import type { z } from "zod";
import type {
  availabilitySchema,
  categorySchema,
  createFavoriteSchema,
  createRequestSchema,
  favoriteSchema,
  levelSchema,
  requestStatusSchema,
  skillSchema,
  swapRequestSchema,
  updateRequestSchema,
  userSchema,
} from "@/lib/schemas";

export type Level = z.infer<typeof levelSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type Category = z.infer<typeof categorySchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type User = z.infer<typeof userSchema>;
export type SwapRequest = z.infer<typeof swapRequestSchema>;
export type Favorite = z.infer<typeof favoriteSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;

/** How well another person fits the current user. */
export type Match = {
  score: number; // 0-100
  theyTeachMe: string[]; // skill ids they teach that I want to learn
  iTeachThem: string[]; // skill ids I teach that they want to learn
  mutual: boolean; // both directions overlap
  availabilityFit: boolean;
};

export type UserWithMatch = User & { match: Match | null };

export type SwapRequestView = SwapRequest & {
  sender: User;
  receiver: User;
  teachSkill: Skill;
  learnSkill: Skill;
};

export type FavoriteView = Favorite & { user: User };

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type UserSort = "relevant" | "experienced" | "recent";

export type UsersQuery = {
  q?: string;
  skill?: string;
  level?: Level;
  category?: Category;
  availability?: Availability;
  sort: UserSort;
  page: number;
  pageSize: number;
};

export type RequestBox = "all" | "received" | "sent" | "accepted";

export type DashboardData = {
  user: User;
  skillsCount: number;
  potentialMatches: number;
  pendingRequests: number;
  favorites: number;
  recentRequests: SwapRequestView[];
};

export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string> };
};
