import type { Match, User } from "@/types";

/**
 * How well does `other` fit `me`?
 * - 40 points if they teach something I want to learn
 * - 40 points if I teach something they want to learn
 * - up to 10 extra points for additional overlapping skills
 * - 10 points if our availability fits
 * Availability and extras only count when there is at least one overlap, so people
 * with nothing in common always score 0.
 */
export function getMatch(me: User, other: User): Match {
  const theyTeachMe = other.teaches
    .map((entry) => entry.skillId)
    .filter((skillId) => me.wantsToLearn.includes(skillId));
  const iTeachThem = me.teaches
    .map((entry) => entry.skillId)
    .filter((skillId) => other.wantsToLearn.includes(skillId));

  const availabilityFit =
    me.availability === "flexible" ||
    other.availability === "flexible" ||
    me.availability === other.availability;

  let score = 0;
  if (theyTeachMe.length > 0) score += 40;
  if (iTeachThem.length > 0) score += 40;

  if (score > 0) {
    const extra = Math.max(0, theyTeachMe.length - 1) + Math.max(0, iTeachThem.length - 1);
    score += Math.min(extra, 2) * 5;
    if (availabilityFit) score += 10;
  }

  return {
    score: Math.min(100, score),
    theyTeachMe,
    iTeachThem,
    mutual: theyTeachMe.length > 0 && iTeachThem.length > 0,
    availabilityFit,
  };
}
