# AI Coding Assistant Instructions for Fashion Muse Studio

## Project Architecture

**Fashion Muse Studio** is a full-stack TypeScript application for AI-powered professional fashion photography generation. The architecture consists of:

- **Client** (Vite + React 19): Located in `client/src/`, uses Wouter for routing, Radix UI for components, TailwindCSS v4 for styling
- **Server** (Express + tRPC): Located in `server/`, tRPC API at `/api/trpc`, OAuth integration at `/api/oauth/callback`
- **Database**: MySQL with Drizzle ORM, schema in `drizzle/schema.ts`, migrations in `drizzle/migrations/`
- **Shared**: Cross-cutting types, constants, and utilities in `shared/` imported via `@shared/*` alias

## Data Flow & Service Boundaries

1. **Image Generation Pipeline**: User uploads photo → `generations.create` mutation deducts credits → Gemini API processes image in background → URLs stored to S3 → UI polls for completion
2. **Authentication**: OAuth callback handler (`server/_core/oauth.ts`) exchanges code for token, creates session JWT, sets secure cookie
3. **Credit System**: Tracked via `creditTransactions` table; deductions happen before generation starts to prevent overspen spending
4. **Gemini Integration**: `geminiImageGen.ts` takes base64 reference image + prompt options (style, camera angle, lighting) and generates multiple variations while preserving face/expression

## Build & Development Commands

```bash
pnpm install          # Sync dependencies after schema/migration changes
pnpm dev              # Watch mode: Express server + Vite middleware (port auto-assigned 3000+)
pnpm build            # Bundle client to dist/public + esbuild server to dist/index.js
pnpm start            # Run production build
pnpm test             # Run Vitest once; add -- --watch for red/green loops
pnpm check            # Type-check with tsc
pnpm format           # Apply Prettier
pnpm db:push          # Generate Drizzle SQL migrations and apply them
```

**Critical**: After pulling schema or migration changes, run `pnpm install && pnpm db:push` before dev.

## Key Architectural Patterns

### tRPC Router Structure (`server/routers.ts`)
Routes are organized by domain (auth, credits, plans, generations, system). All procedures use `publicProcedure`, `protectedProcedure`, or `adminProcedure` from `server/_core/trpc.ts`. Middleware handles authentication; unauthenticated calls throw `UNAUTHED_ERR_MSG`.

**Example**: `protectedProcedure` wraps context with `ctx.user` guarantee; admin calls check `ctx.user.role === "admin"`.

### Client-Side Data Management
- **tRPC + React Query**: `client/src/lib/trpc.ts` exports `trpc` client instance
- **Usage**: `const { data } = trpc.credits.getBalance.useQuery(undefined, { enabled: isAuthenticated })`
- **Mutations**: `trpc.generations.create.useMutation()` automatically handles optimistic updates via React Query cache
- **Error Handling**: Automatic redirect to login on `UNAUTHED_ERR_MSG` via cache subscription in `main.tsx`

### UI Component Library
All UI components live in `client/src/components/ui/` and wrap Radix UI primitives with TailwindCSS styling:
- Consistency enforced via `cn()` utility (merges class lists)
- Data-slot attributes used for styling hooks (e.g., `data-slot="button-primary"`)
- Glass-morphism design system in `glass-ui.css` for premium feel

### Database Patterns
- Schema uses camelCase columns matching generated TypeScript types
- `drizzle/schema.ts` defines tables; **never hand-edit generated SQL migration files**
- Boolean fields use `int` (0 or 1), JSON arrays stored as `text` and parsed on retrieval (see `generations.imageUrls`)
- Foreign key relationships use `varchar` UUIDs; cascade deletes not configured by default

### Authentication & Context
- JWT session tokens created via `sdk.createSessionToken()` with expiry
- `createContext()` in `server/_core/context.ts` runs on every request; optionally extracts user from cookie
- Public procedures receive `user: null` gracefully; protected procedures throw UNAUTHORIZED

## Project-Specific Conventions

### Naming & Code Style
- **Path aliases**: `@/*` for client, `@shared/*` for shared modules; prefer these over `../../../`
- **Component files**: PascalCase (e.g., `GeneratePage.tsx`), utilities: camelCase
- **Prettier enforced**: 2-space indent, double quotes, trailing commas
- **Radix UI + CVA**: Use `class-variance-authority` for component variants (see `select.tsx`, `dropdown-menu.tsx`)

### Environment Variables
Managed in `server/_core/env.ts` with defaults to empty strings:
```
DATABASE_URL, JWT_SECRET, VITE_APP_ID, OAUTH_SERVER_URL, OWNER_OPEN_ID,
GEMINI_API_KEY, BUILT_IN_FORGE_API_KEY, BUILT_IN_FORGE_API_URL
```
Client-side Vite env vars prefixed with `VITE_` (e.g., `VITE_OAUTH_PORTAL_URL`).

### Testing
- Vitest runs server tests only (config in `vitest.config.ts`)
- Test files co-located as `*.test.ts` beside implementation
- Mock tRPC calls and external services; see `sdk.test.ts` for session token testing patterns

## Integration Points & External Dependencies

### Gemini Image Generation (`server/_core/geminiImageGen.ts`)
Uses **gemini-2.5-flash-image** model for professional photography transformation. Key design:
- **Reference Image**: Base64-encoded user's photo (converted by `generateImagesWithGemini()`)
- **Identity Preservation**: Core prompt explicitly instructs model to keep face, expression, clothing unchanged; only enhances lighting/background/quality
- **Style Options** (passed to `STYLE_PROMPTS`): Editorial, Commercial, Artistic, Casual, Glamour, Vintage
- **Camera Angles** (passed to `CAMERA_ANGLE_PROMPTS`): Eye Level, High Angle, Low Angle, Dutch Angle, Over Shoulder, Three Quarter, Profile, Close Up
- **Lighting** (passed to `LIGHTING_PROMPTS`): Natural Light, Studio Light, Dramatic Light, Soft Light, Backlight, Golden Hour
- **Prompt Assembly**: `buildRealisticPrompt()` combines all options into single detailed instruction; each parameter appended as new section with technical requirements at end
- **Batch Generation**: Loop in `routers.ts` calls Gemini once per image; images stored as base64, then uploaded to S3

### OAuth (Manus platform)
`sdk.ts` wraps token exchange and user info retrieval; session JWT created server-side with `ONE_YEAR_MS` expiry via jose library.

### AWS S3 (`@aws-sdk/client-s3`)
Generated images uploaded to `generations/{generationId}/image-*.png` paths; URLs stored to DB and returned to client.

### MySQL (`mysql2` + Drizzle)
Connect via `DATABASE_URL` in env; lazy-init in `server/db.ts` to allow local tooling without DB.

## Critical Gotchas & Workflows

1. **Never ship broken migrations**: Always test `pnpm db:push` locally before PR. SQL files auto-generated by Drizzle; commit them to version control.
2. **Port auto-assignment**: Dev server searches 3000–3019 for available port if 3000 occupied; check console output.
3. **Async image generation**: `generations.create` returns immediately with `status: "processing"`. Background task updates status → imageUrls → completedAt. No webhooks; client must poll or refetch.
4. **Credit enforcement**: Deducted before generation starts; if generation fails, credits are *not* refunded automatically—add recovery flow if needed.
5. **Session expiry**: JWT has `ONE_YEAR_MS` TTL; cookie cleared on logout but client must refetch `auth.me` to see state change.

## Debugging & Common Tasks

- **Check image gen logs**: Look for "Gemini generation error" in server console; fallback uses placeholder URLs
- **Verify S3 upload**: Check `generations/` folder in S3 bucket or trace `storagePut()` errors in logs
- **Debug Drizzle queries**: Add console.logs in `server/db.ts` functions; Drizzle provides `.toSQL()` for query inspection
- **Inspect network calls**: React Query cache visible in React Query DevTools; tRPC batches multiple calls into single `/api/trpc` request
- **Reset credits locally**: Direct MySQL query: `UPDATE users SET credits = 100 WHERE id = 'user-id'`

## File Reference Guide

| File | Purpose |
|------|---------|
| `server/routers.ts` | tRPC route definitions; edit here to add mutations/queries |
| `server/_core/context.ts` | Auth extraction logic; modify for custom context |
| `drizzle/schema.ts` | Database tables; run `pnpm db:push` after changes |
| `server/db.ts` | Query helpers (getUserCredits, createGeneration, etc.); always async |
| `client/src/main.tsx` | tRPC client setup; auto-redirect on auth errors |
| `client/src/App.tsx` | Router & theme setup; add routes to `<Switch>` |
| `client/src/pages/Home.tsx` | Dashboard layout; sub-routes render inside |
| `glass-ui.css` | Glassmorphism design tokens; adjust colors/blur values here |

