# Definition of Done

Every item from the project specification, with the evidence for it.
**Verified** means a test or a build checks it automatically. **You check** means it can only be seen
on your computer or on GitHub.

## Core

| Item | Status | Evidence |
| --- | --- | --- |
| Landing page | Verified | `components/home/*`, `tests/home.test.tsx` |
| Discover | Verified | `components/discover/*`, `tests/discover.test.tsx` |
| Search | Verified | Debounced, case-insensitive, matches names, roles, places and taught skills. `tests/discover.test.tsx`, `tests/api.test.ts` |
| Filters | Verified | Skill, level, category, availability, sort, pagination, all kept in the address |
| Profile | Verified | `components/profile/profile-view.tsx`, `tests/profile.test.tsx` |
| Skill Swap Request | Verified | `components/requests/request-form.tsx`, `tests/request-form.test.tsx` |
| Dashboard | Verified | `components/dashboard/*`, `tests/dashboard.test.tsx` |
| Requests | Verified | Received, Sent and Accepted tabs, instant updates. `tests/requests.test.tsx` |
| Favorites | Verified | `components/favorites/*`, `tests/favorites.test.tsx` |

## Technical

| Item | Status | Evidence |
| --- | --- | --- |
| Next.js | Verified | App Router with static export (`next.config.ts`) |
| TypeScript | Verified | `npm run typecheck` runs in CI and before every deploy |
| Tailwind | Verified | `app/globals.css`, design tokens for light and dark |
| REST API | Verified | `mocks/handlers.ts`, documented in the README, `tests/api.test.ts` |
| React hooks | Verified | State, effects, memo and refs throughout the components |
| Custom hooks | Verified | `hooks/` (`useUsers`, `useRequests`, `useFavorites`, `useDiscoverFilters`, ...) |
| Form validation | Verified | Zod schema + React Hook Form. `tests/request-form.test.tsx` |
| Error handling | Verified | Every page has a tested error state with "Try again", and failed actions roll back |
| Loading states | Verified | Placeholders and `Loading ...` messages on every page, each tested |
| Responsive design | You check | Layouts use responsive Tailwind classes and a mobile menu. Look at it at phone, tablet and desktop widths |

## Quality

| Item | Status | Evidence |
| --- | --- | --- |
| Accessibility | Verified | `tests/audit.test.tsx` runs axe-core on 14 page states. `tests/contrast.test.ts` checks colour contrast against the real stylesheet |
| Clean components | Verified | Small components, one job each, shared UI in `components/ui`. `npm run lint` is clean |
| No console errors | Partly | The test console is clean, and the tests fail on unexpected requests. You check the browser console once on the live site |
| No broken links | Verified | `tests/audit.test.tsx` reads the real routes from the `app` folder and checks every link on every page state |
| Good UX | Partly | Instant updates, clear messages, shareable searches, a demo user switcher. A person should try it and tell you what feels odd |
| README | Verified | `README.md` has every section from the specification, except real screenshots |
| Git history | Verified | Conventional commit messages, one branch per feature, merged into `main` |
| Pull Requests | You check | The history shows the branch workflow, but GitHub pull requests need real branches. See `docs/DEPLOYMENT.md`, section 6 |
| Deployment | You check | The workflows are ready and use verified action versions, but only your push to GitHub can run them |

## What you still do yourself

1. Push to GitHub and turn on Pages (`docs/DEPLOYMENT.md`).
2. Open the live site, click through every page, and check the browser console (F12).
3. Add 4 to 6 screenshots to `docs/screenshots/` and link them in the README.
4. Look at the site on a phone and in dark mode.
5. Use real pull requests for your next change.
