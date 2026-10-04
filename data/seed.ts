import type { Favorite, SwapRequest } from "@/types";

/** Starting data for requests and favorites. Reset restores exactly this. */
export const seedRequests: SwapRequest[] = [
  { id: "r1", senderId: "u3", receiverId: "u1", teachSkillId: "uiux", learnSkillId: "react", message: "Hi Mahsa! I'd love to exchange UI/UX guidance for React help. I can review your designs weekly.", status: "pending", createdAt: "2026-09-28T10:00:00.000Z", updatedAt: "2026-09-28T10:00:00.000Z" },
  { id: "r2", senderId: "u4", receiverId: "u1", teachSkillId: "figma", learnSkillId: "javascript", message: "I can teach you Figma from scratch if you walk me through JavaScript basics.", status: "pending", createdAt: "2026-09-30T14:30:00.000Z", updatedAt: "2026-09-30T14:30:00.000Z" },
  { id: "r3", senderId: "u30", receiverId: "u1", teachSkillId: "git", learnSkillId: "react", message: "I'm new to React and could use help. I can show you Git workflows in return.", status: "pending", createdAt: "2026-10-02T08:15:00.000Z", updatedAt: "2026-10-02T08:15:00.000Z" },
  { id: "r4", senderId: "u1", receiverId: "u28", teachSkillId: "react", learnSkillId: "uiux", message: "Hello Nina! I'd like to learn UI/UX from you and can teach React in exchange.", status: "accepted", createdAt: "2026-09-20T09:00:00.000Z", updatedAt: "2026-09-21T12:00:00.000Z" },
  { id: "r5", senderId: "u1", receiverId: "u3", teachSkillId: "react", learnSkillId: "figma", message: "Hi Alex, could you teach me Figma? I can help you with React in return.", status: "pending", createdAt: "2026-10-01T16:45:00.000Z", updatedAt: "2026-10-01T16:45:00.000Z" },
  { id: "r6", senderId: "u1", receiverId: "u24", teachSkillId: "javascript", learnSkillId: "uiux", message: "Hi Grace, I'd love UI/UX tips and can offer JavaScript mentoring.", status: "rejected", createdAt: "2026-09-15T11:00:00.000Z", updatedAt: "2026-09-16T08:00:00.000Z" },
  { id: "r7", senderId: "u3", receiverId: "u19", teachSkillId: "uiux", learnSkillId: "react", message: "Carlos, let's swap: UI/UX sessions from me, React deep dives from you.", status: "pending", createdAt: "2026-09-29T13:00:00.000Z", updatedAt: "2026-09-29T13:00:00.000Z" },
  { id: "r8", senderId: "u12", receiverId: "u13", teachSkillId: "cooking", learnSkillId: "photography", message: "I'll teach you my favourite pasta recipes if you teach me food photography.", status: "accepted", createdAt: "2026-09-10T10:00:00.000Z", updatedAt: "2026-09-11T10:00:00.000Z" },
  { id: "r9", senderId: "u15", receiverId: "u7", teachSkillId: "yoga", learnSkillId: "spanish", message: "Yoga lessons for Spanish conversation practice? I'd really enjoy that.", status: "accepted", createdAt: "2026-09-05T10:00:00.000Z", updatedAt: "2026-09-06T10:00:00.000Z" },
  { id: "r10", senderId: "u10", receiverId: "u25", teachSkillId: "guitar", learnSkillId: "video-editing", message: "I can teach you guitar if you show me the basics of video editing.", status: "rejected", createdAt: "2026-09-02T10:00:00.000Z", updatedAt: "2026-09-03T10:00:00.000Z" },
];

export const seedFavorites: Favorite[] = [
  { id: "f1", userId: "u1", targetUserId: "u3" },
  { id: "f2", userId: "u1", targetUserId: "u28" },
  { id: "f3", userId: "u1", targetUserId: "u19" },
  { id: "f4", userId: "u2", targetUserId: "u3" },
];
