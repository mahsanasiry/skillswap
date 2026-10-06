# SkillSwap

> Learn together. Share what you know.

SkillSwap is a peer-to-peer skill exchange platform where people can discover compatible users, compare skills and exchange knowledge without paying for lessons.

🌐 **Live Demo:** https://mahsanasiry.github.io/skillswap/

## Features

- Search, filter, sort and paginate users by skill, level, category and availability
- Skill-based match scoring from 0 to 100
- Mutual match detection for compatible skill exchanges
- User profiles with skills, levels and availability
- Skill-swap requests with form validation
- Requests management with received, sent and accepted states
- Favorites
- Personal dashboard with statistics and recent activity
- Demo user switching to explore different sides of a swap
- Dark mode with persisted preference
- Responsive and accessible interface
- Loading, empty and error states throughout the application

## Tech Stack

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- MSW
- Vitest
- React Testing Library
- axe-core
- GitHub Actions
- GitHub Pages

## Testing

The project includes automated tests covering:

- Search and filtering
- Skill matching
- Request creation and status changes
- Favorites
- Dashboard behavior
- Form validation
- Error and rollback states
- Broken links
- Accessibility checks with axe-core
- Color contrast

## Architecture

SkillSwap uses a mock REST API running in the browser with MSW. The application is structured so that a real backend can replace the mock API later without requiring major changes to the UI.

There is no real authentication or backend server. Demo users are used to simulate authenticated sessions, and application data is persisted locally in the browser.

## Accessibility

The interface includes semantic HTML, keyboard navigation, visible focus states, labelled form controls, skip navigation, screen-reader announcements and WCAG AA color contrast checks.

## Project Highlights

SkillSwap was built as a portfolio project with a focus on real-world front-end development practices, including:

- Type-safe development with TypeScript
- Client-side data fetching and caching
- Form validation
- Reusable components and custom hooks
- Automated testing
- Accessibility
- Responsive design
- CI/CD with GitHub Actions
- Static deployment to GitHub Pages

## Source Code

https://github.com/mahsanasiry/skillswap