import { z } from "zod";

/** Single source of truth: every type in the app is inferred from these schemas. */

export const LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export const AVAILABILITIES = ["weekdays", "evenings", "weekends", "flexible"] as const;
export const CATEGORIES = [
  "Development",
  "Design",
  "Languages",
  "Music",
  "Business",
  "Creative",
  "Lifestyle",
] as const;
export const REQUEST_STATUSES = ["pending", "accepted", "rejected", "cancelled"] as const;

export const levelSchema = z.enum(LEVELS);
export const availabilitySchema = z.enum(AVAILABILITIES);
export const categorySchema = z.enum(CATEGORIES);
export const requestStatusSchema = z.enum(REQUEST_STATUSES);

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: categorySchema,
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  avatar: z.object({ initials: z.string(), hue: z.number() }),
  role: z.string(),
  bio: z.string(),
  location: z.string(),
  level: levelSchema,
  yearsExperience: z.number().int().min(0),
  teaches: z.array(z.object({ skillId: z.string(), level: levelSchema })),
  wantsToLearn: z.array(z.string()),
  availability: availabilitySchema,
  joinedAt: z.string(),
});

export const swapRequestSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  teachSkillId: z.string(), // a skill the sender teaches
  learnSkillId: z.string(), // a skill the sender wants to learn from the receiver
  message: z.string(),
  status: requestStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const favoriteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  targetUserId: z.string(),
});

/** What the "Request Skill Swap" form sends. Messages here are shown to the user. */
export const createRequestSchema = z.object({
  receiverId: z.string().min(1, "Choose who to send this to"),
  teachSkillId: z.string().min(1, "Choose a skill you can teach"),
  learnSkillId: z.string().min(1, "Choose a skill you want to learn"),
  message: z
    .string()
    .trim()
    .min(1, "Write a short message")
    .min(10, "Write at least 10 characters")
    .max(500, "Keep the message under 500 characters"),
});

export const updateRequestSchema = z.object({
  status: z.enum(["accepted", "rejected", "cancelled"]),
});

export const createFavoriteSchema = z.object({
  targetUserId: z.string().min(1),
});

export const dbStateSchema = z.object({
  requests: z.array(swapRequestSchema),
  favorites: z.array(favoriteSchema),
});
