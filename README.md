# SkillSwap

> Learn together. Share what you know.

SkillSwap is a peer-to-peer skill exchange platform. You list what you can teach and what you want to
learn, and SkillSwap finds people whose lists fit yours. Two people can then agree to trade lessons
instead of paying for them.

**Live demo:** https://mahsanasiry.github.io/skillswap/ (after your first deploy, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md))
**Code:** https://github.com/mahsanasiry/skillswap

## About

This is a front-end focused portfolio project. It is built like a real product: typed data model, a REST
API layer, loading, empty and error states on every page, form validation, tests, an accessibility
audit and automatic deployment.

There is no real login and no server. A few demo users stand in for authentication, and a mock REST
API runs inside the browser, so the whole app works as a static site (for example on GitHub Pages).
Your actions are saved in your browser, so they survive a refresh.

## Features

- **Landing page** with search, how it works, popular skills and the best matches for you.
- **Discover**: search, filter by skill, level, category and availability, sort, and paginate.
  Everything is stored in the address bar, so a search is a link you can share.
- **Match score**: each person gets a score from 0 to 100. A _mutual match_ means you can teach each
  other (they teach what you want, and you teach what they want).
- **Profiles** with levels, availability, and a plain explanation of how you fit.
- **Skill swap requests** with a validated form (React Hook Form + Zod).
- **Requests page** with Received, Sent and Accepted tabs. Accept, reject or cancel, and the page
  updates at once, without a refresh.
- **Favorites** you can add and remove.
- **Dashboard** with your numbers, recent requests and best matches.
- **Demo user switcher**: view the app as another person to see both sides of a swap.
- **Dark mode**, remembered between visits and applied before the first paint (no flash).
- **Accessible**: semantic HTML, keyboard navigation, visible focus, labelled forms, a skip link,
  screen reader announcements, and checked colour contrast.

## Tech Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js (App Router, static export), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Forms and validation | React Hook Form, Zod |
| Server state | TanStack Query (caching, optimistic updates) |
| REST API | Mock REST API in the browser with MSW |
| Tests | Vitest, React Testing Library, axe-core |
| CI and hosting | GitHub Actions, GitHub Pages |

State is handled with React state, context and custom hooks plus TanStack Query. Redux was left out on
purpose: it would only add complexity here.

## Screenshots

_Add screenshots here after your first run. Suggested: home, Discover, a profile with the request form
open, Requests, Dashboard, and one page in dark mode. Put the images in `docs/screenshots/` and link
them below._

<!--
![Home](docs/screenshots/home.png)
![Discover](docs/screenshots/discover.png)
-->

## Installation

You need Node.js 20 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Check the code style |
| `npm run typecheck` | Check the TypeScript types |
| `npm test` | Run all tests |
| `npm run build` | Build the static site into `out/` (for a site served from the root) |
| `npm run build:pages` | Build for GitHub Pages (adds the `/skillswap` base path) |
| `npm run start` | Serve the built site from `out/`, with the right base path |
| `npm run verify` | Lint, typecheck, test and build in one go |

## Environment Variables

None are required. There are no secrets and no API keys.

| Variable | Used for |
| --- | --- |
| `GITHUB_PAGES=true` | Set at build time to add the `/skillswap` base path for GitHub Pages. The workflows set it for you. Leave it out to build for a site served from the root. |

If your repository has a different name, change `repoName` in `next.config.ts`.

For demos, three values in the browser's `localStorage` are handy:

| Key | Effect |
| --- | --- |
| `skillswap:simulate-error` = `1` | Every API call fails, so you can see the error states. Remove it to go back. |
| `skillswap:demo-user` | The demo user who is "logged in" (`u1`, `u2` or `u3`). |
| `skillswap:db:v1` | The saved requests and favorites. The footer button "Reset demo data" restores the originals. |

## API

A mock REST API answers real `fetch` calls inside the browser (see `mocks/handlers.ts`). The code is
written as if a server existed, so a real backend can replace it later without touching the pages.
Every call sends `X-Demo-User-Id` to say who is asking.

| Method and path | Purpose |
| --- | --- |
| `GET /api/users` | Search people. Query: `q`, `skill`, `level`, `category`, `availability`, `sort` (`relevant`, `experienced`, `recent`), `page`, `pageSize` |
| `GET /api/users/:id` | One person, with a match score for the current user |
| `GET /api/skills` | All skills |
| `GET /api/skills/:id` | One skill |
| `GET /api/requests?box=` | Requests for the current user. `box`: `all`, `received`, `sent`, `accepted` |
| `POST /api/requests` | Send a request |
| `PATCH /api/requests/:id` | Accept or reject (receiver), or cancel (sender) |
| `GET /api/favorites` | The current user's favorites |
| `POST /api/favorites` | Add a favorite (safe to repeat) |
| `DELETE /api/favorites/:id` | Remove a favorite |
| `GET /api/dashboard` | Numbers and recent requests for the dashboard |
| `POST /api/reset` | Restore the demo data |

Errors share one shape: `{ "error": { "code", "message", "fields?" } }`. The status codes are `400`
(invalid input, with a message per field), `403` (not allowed), `404`, `409` (a duplicate request, or a
request that was already answered) and `500`.

Business rules, enforced by the API and covered by tests: you cannot send a request to yourself; you can
only offer a skill you teach and ask for a skill they teach; only one pending request between two
people; only the receiver can accept or reject; only the sender can cancel; an answered request cannot
be changed.

## Project Structure

```
skillswap/
├── app/              Pages (Next.js App Router): /, discover, dashboard, requests,
│                     favorites, profile/[id], plus the 404 page
├── components/
│   ├── ui/           Buttons, tabs, form fields, states, icons
│   ├── layout/       Navbar, footer, theme toggle, demo user switcher
│   ├── home/         Landing page sections
│   ├── discover/     Search, filters, pagination
│   ├── profile/      The profile page
│   ├── requests/     Request form, request list and cards
│   ├── favorites/    The favorites page
│   ├── dashboard/    Stats and recent requests
│   ├── users/        User card, favorite button
│   └── providers/    React Query, theme and demo-user providers
├── hooks/            Custom hooks: useUsers, useRequests, useFavorites, ...
├── lib/              Schemas (Zod), API client, matching, query parsing, helpers
├── types/            Types shared by the whole app
├── data/             Seed data: 30 people, 27 skills, sample requests
├── mocks/            The mock REST API (MSW)
├── tests/            All tests
├── docs/             Deployment guide and Definition of Done
└── .github/          CI and deployment workflows, pull request template
```

Types are inferred from the Zod schemas in `lib/schemas.ts`, so there is one source of truth.

## Testing

```bash
npm test
```

The tests cover search and filters, the request form and its validation, request status changes
(including failures and rollbacks), favorites, the dashboard, and the match score. They also check
every page for broken links and accessibility problems (axe-core), and check colour contrast against
the real stylesheet. The checkers themselves are tested too, so a pass means something.

## Accessibility

Semantic landmarks, one `h1` per page, a skip link, labelled controls, errors linked to their fields,
keyboard-friendly tabs (arrow keys, Home, End), visible focus rings, a reduced-motion setting,
screen reader announcements for results and actions, and colour pairs that meet WCAG AA.

## Known limitations

- The mock API starts in the browser, so the first HTML is a short loading message and the content
  appears a moment later. This is fine for a demo, but search engines will not see the content. A real
  backend with server rendering would fix this.
- Data lives in `localStorage`: it is private to one browser and is not shared between people.
- Real authentication, chat, video calls, payments and notifications are out of scope on purpose.

## Git workflow

Work happens on branches (`feature/...`, `fix/...`, `chore/...`) and reaches `main` through pull
requests. The CI workflow runs lint, typecheck, tests and the production build on every branch and
pull request. Merging to `main` deploys the site.

## Future Improvements

- A real backend and database, with real authentication.
- Edit your own profile and skills in the app.
- Chat and scheduling for accepted swaps.
- Notifications for new and answered requests.
- Server-rendered pages for search engines.
- End-to-end tests in a real browser.
- Multiple languages and right-to-left layout.

## Live Demo

https://mahsanasiry.github.io/skillswap/
