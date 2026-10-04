import type { Availability, Level, User } from "@/types";

/**
 * Compact seed rows. "react:advanced" means: teaches React at advanced level.
 * The first user (u1) is the default demo user. u2 and u3 are alternative demo users.
 */
type Row = {
  name: string;
  role: string;
  location: string;
  teaches: string;
  wants: string;
  level: Level;
  years: number;
  availability: Availability;
  joinedAt: string;
};

const rows: Row[] = [
  { name: "Mahsa Nasiri", role: "Frontend Developer", location: "Remote", teaches: "react:intermediate javascript:intermediate", wants: "uiux figma", level: "intermediate", years: 2, availability: "evenings", joinedAt: "2026-01-10" },
  { name: "Sarah Chen", role: "Frontend Developer", location: "Toronto, Canada", teaches: "react:advanced typescript:advanced nextjs:intermediate", wants: "uiux", level: "advanced", years: 6, availability: "weekdays", joinedAt: "2025-11-02" },
  { name: "Alex Rivera", role: "Product Designer", location: "Madrid, Spain", teaches: "uiux:expert figma:advanced", wants: "react typescript", level: "expert", years: 9, availability: "flexible", joinedAt: "2025-08-15" },
  { name: "Daniel Okafor", role: "UI Designer", location: "Lagos, Nigeria", teaches: "figma:advanced graphic-design:advanced", wants: "javascript react", level: "advanced", years: 5, availability: "evenings", joinedAt: "2026-02-20" },
  { name: "John Park", role: "Full-Stack Developer", location: "Seoul, South Korea", teaches: "nodejs:advanced python:intermediate git:advanced", wants: "uiux english", level: "advanced", years: 7, availability: "weekends", joinedAt: "2025-10-05" },
  { name: "Priya Nair", role: "Data Analyst", location: "Bengaluru, India", teaches: "python:advanced excel:expert", wants: "public-speaking writing", level: "advanced", years: 6, availability: "weekdays", joinedAt: "2026-03-12" },
  { name: "Lucía Fernández", role: "Spanish Teacher", location: "Valencia, Spain", teaches: "spanish:expert", wants: "english photography", level: "expert", years: 10, availability: "evenings", joinedAt: "2025-09-21" },
  { name: "Tom Becker", role: "Backend Developer", location: "Berlin, Germany", teaches: "nodejs:expert git:expert typescript:advanced", wants: "guitar spanish", level: "expert", years: 12, availability: "weekends", joinedAt: "2025-07-30" },
  { name: "Amira Haddad", role: "Marketing Lead", location: "Dubai, UAE", teaches: "marketing:expert public-speaking:advanced", wants: "python excel", level: "advanced", years: 8, availability: "weekdays", joinedAt: "2026-01-28" },
  { name: "Noah Williams", role: "Guitar Teacher", location: "Austin, USA", teaches: "guitar:expert piano:intermediate", wants: "cooking video-editing", level: "expert", years: 15, availability: "evenings", joinedAt: "2025-12-11" },
  { name: "Elena Petrova", role: "Motion Designer", location: "Prague, Czechia", teaches: "motion-design:advanced video-editing:advanced figma:intermediate", wants: "react javascript", level: "advanced", years: 5, availability: "flexible", joinedAt: "2026-04-02" },
  { name: "Marco Rossi", role: "Chef and Writer", location: "Bologna, Italy", teaches: "cooking:expert writing:intermediate", wants: "english photography", level: "expert", years: 14, availability: "weekends", joinedAt: "2025-06-18" },
  { name: "Yuki Tanaka", role: "Photographer", location: "Osaka, Japan", teaches: "photography:expert video-editing:intermediate", wants: "english python", level: "expert", years: 11, availability: "weekends", joinedAt: "2026-02-03" },
  { name: "Fatima Zahra", role: "Persian Language Tutor", location: "Isfahan, Iran", teaches: "persian:expert english:advanced", wants: "typescript nextjs", level: "advanced", years: 7, availability: "flexible", joinedAt: "2026-05-06" },
  { name: "Oliver Smith", role: "Yoga Instructor", location: "Bristol, UK", teaches: "yoga:expert", wants: "spanish drawing", level: "expert", years: 9, availability: "evenings", joinedAt: "2025-10-27" },
  { name: "Chloé Dubois", role: "French Teacher", location: "Lyon, France", teaches: "french:expert english:advanced", wants: "graphic-design uiux", level: "expert", years: 8, availability: "weekdays", joinedAt: "2026-03-30" },
  { name: "Ravi Menon", role: "DevOps Engineer", location: "Pune, India", teaches: "git:expert python:advanced nodejs:intermediate", wants: "public-speaking guitar", level: "advanced", years: 8, availability: "weekends", joinedAt: "2025-11-19" },
  { name: "Hannah Müller", role: "Illustrator", location: "Hamburg, Germany", teaches: "drawing:expert graphic-design:advanced german:expert", wants: "javascript motion-design", level: "expert", years: 10, availability: "flexible", joinedAt: "2026-01-05" },
  { name: "Carlos Mendes", role: "Frontend Engineer", location: "Lisbon, Portugal", teaches: "react:expert nextjs:advanced javascript:expert", wants: "figma motion-design", level: "expert", years: 8, availability: "weekdays", joinedAt: "2025-09-09" },
  { name: "Mei Lin", role: "Piano Teacher", location: "Singapore", teaches: "piano:expert", wants: "english excel", level: "expert", years: 12, availability: "evenings", joinedAt: "2026-02-14" },
  { name: "Ben Carter", role: "Startup Founder", location: "Sydney, Australia", teaches: "marketing:advanced public-speaking:expert excel:advanced", wants: "react nextjs", level: "advanced", years: 10, availability: "weekdays", joinedAt: "2025-12-29" },
  { name: "Sofia Marino", role: "Content Writer", location: "Buenos Aires, Argentina", teaches: "writing:expert spanish:expert", wants: "uiux photography", level: "expert", years: 9, availability: "flexible", joinedAt: "2026-03-08" },
  { name: "Omar Khalid", role: "JavaScript Mentor", location: "Cairo, Egypt", teaches: "javascript:expert react:advanced git:advanced", wants: "english uiux", level: "expert", years: 9, availability: "evenings", joinedAt: "2025-08-01" },
  { name: "Grace Okoye", role: "UX Researcher", location: "Accra, Ghana", teaches: "uiux:advanced writing:advanced", wants: "typescript react", level: "advanced", years: 6, availability: "weekdays", joinedAt: "2026-04-17" },
  { name: "Lars Nielsen", role: "Video Editor", location: "Copenhagen, Denmark", teaches: "video-editing:expert motion-design:intermediate", wants: "python nodejs", level: "expert", years: 11, availability: "weekends", joinedAt: "2025-10-14" },
  { name: "Aisha Rahman", role: "Excel Trainer", location: "Dhaka, Bangladesh", teaches: "excel:expert", wants: "english public-speaking", level: "advanced", years: 7, availability: "flexible", joinedAt: "2026-05-22" },
  { name: "Diego Alvarez", role: "Software Engineer", location: "Mexico City, Mexico", teaches: "typescript:advanced react:advanced python:intermediate", wants: "english yoga", level: "advanced", years: 6, availability: "evenings", joinedAt: "2026-01-19" },
  { name: "Nina Kowalski", role: "Brand Designer", location: "Warsaw, Poland", teaches: "graphic-design:expert uiux:advanced figma:expert", wants: "react nextjs", level: "expert", years: 9, availability: "weekdays", joinedAt: "2025-11-25" },
  { name: "Ethan Brooks", role: "Public Speaking Coach", location: "Chicago, USA", teaches: "public-speaking:expert english:expert", wants: "figma drawing", level: "expert", years: 13, availability: "weekends", joinedAt: "2026-02-26" },
  { name: "Zoe Anderson", role: "Junior Developer", location: "Wellington, New Zealand", teaches: "git:intermediate javascript:beginner", wants: "typescript react", level: "beginner", years: 1, availability: "flexible", joinedAt: "2026-06-03" },
];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function usernameOf(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .trim()
    .replace(/\s+/g, ".");
}

export const users: User[] = rows.map((row, index) => {
  const teaches = row.teaches.split(" ").map((entry) => {
    const [skillId, level] = entry.split(":");
    return { skillId, level: level as Level };
  });
  const wantsToLearn = row.wants.split(" ");
  return {
    id: `u${index + 1}`,
    name: row.name,
    username: usernameOf(row.name),
    avatar: { initials: initialsOf(row.name), hue: (index * 47) % 360 },
    role: row.role,
    bio: `${row.role} based in ${row.location}, with ${row.years} ${
      row.years === 1 ? "year" : "years"
    } of experience. Happy to help others get better at what I do, and looking for someone to guide me in return.`,
    location: row.location,
    level: row.level,
    yearsExperience: row.years,
    teaches,
    wantsToLearn,
    availability: row.availability,
    joinedAt: `${row.joinedAt}T09:00:00.000Z`,
  };
});

export const DEMO_USER_IDS = ["u1", "u2", "u3"] as const;
export const DEFAULT_DEMO_USER_ID = "u1";
