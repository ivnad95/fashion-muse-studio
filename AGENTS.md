# Repository Guidelines

## Project Structure & Module Organization
- `client/`: Vite-powered React UI (entry `src/main.tsx`); static assets live in `public/`.
- `server/`: Express + tRPC backend with `_core/` bootstrapping, `routers.ts` for API composition, and `storage.ts` for S3 helpers.
- `shared/`: Cross-cutting constants, schemas, and utilities imported via `@shared/*`.
- `drizzle/`: Database schema (`schema.ts`), relation helpers, and SQL migration history (`migrations/`); keep generated SQL files under version control.

## Build, Test, and Development Commands
- `pnpm install`: Sync dependencies; run after pulling schema or migration changes.
- `pnpm dev`: Launch the full stack in watch mode (Express server with Vite middleware).
- `pnpm build`: Bundle the client and Node entry point into `dist/`.
- `pnpm start`: Serve the bundled build in production mode.
- `pnpm test`: Execute Vitest suites once; add `-- --watch` for red/green loops.
- `pnpm check`: Type-check with `tsc`.
- `pnpm format`: Apply Prettier to every tracked file.
- `pnpm db:push`: Generate new Drizzle SQL and apply pending migrations.

## Coding Style & Naming Conventions
- TypeScript-first codebase; prefer named exports.
- Use 2-space indentation, double quotes, and trailing commas as enforced by Prettier.
- Path aliases: `@/*` for client code, `@shared/*` for shared modules; avoid relative `../../`.
- UI components, hooks, and routers use PascalCase filenames; helper utilities and constants use camelCase/kebab-case to mirror existing patterns.
- Never hand-edit generated Drizzle SQL or schema artifacts—regenerate via CLI if changes are needed.

## Testing Guidelines
- Vitest drives unit and integration coverage; co-locate specs as `*.test.ts` or `*.test.tsx` beside the implementation.
- Mock TRPC calls and remote services; avoid live network hits in tests.
- Use `pnpm test -- --coverage` before shipping significant platform changes and include summaries in the PR description.

## Commit & Pull Request Guidelines
- Follow the repo’s imperative, concise commit voice (e.g., `Fix image upload retry`, `Document flux setup`).
- Each PR must explain scope, risk, and rollout; link issues and add screenshots/gifs for UI-facing work.
- Call out schema or environment variable changes explicitly and reference migration filenames when Drizzle schema shifts.
- Ensure `pnpm check`, `pnpm test`, and `pnpm build` pass locally before requesting review.

## Environment & Secrets
- Maintain a local `.env` with the keys consumed in `server/_core/env.ts` (`DATABASE_URL`, `JWT_SECRET`, `BUILT_IN_FORGE_API_KEY`, Gemini/BFL image keys, etc.).
- Keep secrets out of commits; store them in a secrets manager and rotate shared credentials through secure channels.
