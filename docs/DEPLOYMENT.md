# Deployment guide

SkillSwap builds to a plain static site (`out/`), so it can be hosted almost anywhere. The repository is
set up for **GitHub Pages**, deployed by GitHub Actions.

## 1. Check everything on your computer first

```bash
npm install
npm run verify        # lint, typecheck, tests and the production build
npm run build:pages   # the exact build GitHub will publish (adds the /skillswap base path)
npm run start         # serves it, then open the address it prints
```

`npm run start` prints `http://localhost:3000/skillswap/` after `build:pages`, and
`http://localhost:3000/` after a plain `npm run build`. Click through every page once.
(`build:pages` is a small script, so it works the same on Windows, macOS and Linux.)

## 2. Put the code on GitHub

1. On GitHub, create a **public** repository named `skillswap` (no README, no .gitignore, no license).
2. In the project folder:

```bash
git remote add origin https://github.com/mahsanasiry/skillswap.git
git push -u origin main
```

If your repository has a different name, change `repoName` in `next.config.ts` first.

## 3. Turn on GitHub Pages

1. Repository, **Settings**, **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or open the **Actions** tab and run **Deploy to GitHub Pages**).
4. After a minute or two the site is at `https://mahsanasiry.github.io/skillswap/`.

The deploy workflow runs lint, typecheck and tests first. If any of them fails, nothing is published.

## 4. If GitHub does not work from your location

Access to GitHub services from Iran has changed over the years, and reports disagree about the current
state of Actions and account features. If pushing, Actions or Pages is blocked for you, the project
does not depend on them:

- **Build on your own computer, host anywhere.** Run `npm run build` (without `GITHUB_PAGES`). The
  folder `out/` is a complete static site for a site served from the root of a domain. Upload it to any
  static host. If the site is served from a sub-folder, set `GITHUB_PAGES=true` and change `repoName`
  in `next.config.ts` to that folder's name.
- **Hosts inside the country** may be an option. Check that they accept a plain static folder.
- Keep the code safe locally with Git. A remote can be added later.

## 5. Your Git identity

The commits in this repository were made with a placeholder author. Set your own before you push, so
the history shows your name:

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

To rewrite the existing history with your name (this changes every commit id, so only do it before you
push, and keep a copy of the folder first):

```bash
git filter-branch -f --env-filter '
export GIT_AUTHOR_NAME="Your Name"; export GIT_AUTHOR_EMAIL="you@example.com";
export GIT_COMMITTER_NAME="Your Name"; export GIT_COMMITTER_EMAIL="you@example.com"' -- --all
```

## 6. Pull requests from now on

The history already shows the feature-branch workflow (branches `feature/...` merged into `main`).
Those branches are already merged, so GitHub cannot open pull requests for them. For new work, use real
pull requests:

```bash
git checkout -b feature/edit-profile
# change code, then
npm run verify
git add -A && git commit -m "feat(profile): let people edit their skills"
git push -u origin feature/edit-profile
```

Open a pull request on GitHub. The CI workflow runs on it, and the pull request template reminds you
what to check. Merge it when the checks pass, and the site redeploys.
