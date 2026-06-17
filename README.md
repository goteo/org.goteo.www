# Goteo v4 Web

Frontend for the [Goteo](https://goteo.org) crowdfunding platform — built on Astro 5 + Svelte 5 + TailwindCSS 4, deployed on Cloudflare Workers.

## Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | Astro 5                                       |
| UI         | Svelte 5 (runes), TailwindCSS 4               |
| Language   | TypeScript 5                                  |
| Runtime    | Cloudflare Workers (also supports Node)       |
| API client | `@hey-api/client-fetch` (generated OpenAPI)   |
| Testing    | Vitest (unit), Cypress (E2E), Storybook       |

## Commands

| Command               | Action                                              |
| :-------------------- | :-------------------------------------------------- |
| `pnpm install`        | Install dependencies                                |
| `pnpm dev`            | Dev server at `localhost:4321`                      |
| `pnpm dev:worker`     | Build + Wrangler Workers dev server at `localhost:4321` |
| `pnpm build`          | Build for production                                |
| `pnpm preview`        | Preview production build locally                    |
| `pnpm format`         | ESLint fix + Prettier write                         |
| `pnpm check`          | Prettier format check                               |
| `pnpm openapi`        | Regenerate OpenAPI SDK from live API spec           |
| `pnpm storybook`      | Storybook dev server at `localhost:6006`            |
| `pnpm build-storybook`| Build Storybook static output                       |
| `pnpm cypress:open`   | Cypress E2E interactive                             |
| `pnpm cypress:run`    | Cypress E2E headless                                |
| `pnpm test:e2e`       | Start dev server + run Cypress headless             |
| `pnpm test:e2e:ci`    | CI E2E against Workers preview build                |

## Routes

All user-facing pages live under `src/pages/[...locale]/` (locale prefix: `es`, `en`, `ca`).

| Route                                | Page                        |
| ------------------------------------ | --------------------------- |
| `/`                                  | Home                        |
| `/search`                            | Project search              |
| `/project/[idOrSlug]`                | Project detail              |
| `/project/[idOrSlug]/edit`           | Project editor (auth)       |
| `/create/project`                    | Create project (auth)       |
| `/checkout`                          | Checkout cart               |
| `/checkout/payment`                  | Payment                     |
| `/checkout/post-payment`             | Post-payment confirmation   |
| `/checkout/verify`                   | Payment verification        |
| `/checkout/wallet`                   | Wallet confirmation         |
| `/login`                             | Login                       |
| `/login/callback`                    | OAuth2 callback             |
| `/logout`                            | Logout                      |
| `/register`                          | Register                    |
| `/me`                                | My profile (auth)           |
| `/user/[idOrHandle]`                 | Public user profile         |
| `/about`                             | About                       |
| `/static/[fileName]`                 | CMS static content          |
| `/admin/charges`                     | Admin contributions (auth)  |
| `/403`, `/404`, `/500`               | Error pages                 |

API endpoints under `src/pages/api/`:

| Endpoint                      | Purpose                          |
| ----------------------------- | -------------------------------- |
| `/api/relay/[...path]`        | Authenticated API proxy          |
| `/api/upload/preupload`       | S3 pre-signed URL generation     |
| `/api/upload/postupload`      | S3 post-upload validation        |

## Project Structure

```
src/
├── actions/          # Astro server actions (form mutations)
├── auth/             # JWT sessions, OAuth2 tokens, refresh logic
├── components/       # Svelte components (PascalCase filenames)
│   ├── library/      # Reusable UI primitives + Storybook stories
│   ├── Admin/        # Admin-specific components
│   ├── icons/        # Icon SVG components
│   └── [Feature]/    # Feature-scoped (project/, profile/, Checkout/, etc.)
├── firewall/         # Route access control rules
├── i18n/             # Translations (es/en/ca) + t() store
├── layouts/          # Astro layout components
├── middleware/       # Astro request middleware (auth, locale, firewall)
├── openapi/          # OpenAPI SDK (generated) + config
├── pages/            # Astro routes
│   ├── [...locale]/  # All user-facing pages under locale prefix
│   └── api/          # Server-side API endpoints
├── services/         # Business logic & API call wrappers
├── stores/           # Svelte stores (client-side state)
│   └── drafts/       # Project draft persistence (Dexie/IndexedDB)
├── stories/          # Full-page Storybook stories
├── styles/           # Global CSS + Tailwind theme tokens
├── svgs/             # SVG Svelte components
├── types/            # Shared TypeScript interfaces
└── utils/            # Pure helper functions
    └── drafts/       # Draft DB repository helpers
```

## CI / Deployment

| Workflow           | Trigger           | Action                             |
| ------------------ | ----------------- | ---------------------------------- |
| `deploy.yml`       | Push to `main`    | Deploy to Cloudflare (production)  |
| `deploy.yml`       | Push to `develop` | Deploy to Cloudflare (staging)     |
| `cypress-tests.yml`| PR / push         | Cypress E2E headless               |
| `prettier-check.yml`| PR / push        | Prettier format check              |

## Before opening a PR

```bash
pnpm format         # Fix formatting
pnpm cypress:run    # E2E must pass
```
