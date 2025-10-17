# Fashion Muse Studio - Code Review

**Date**: October 17, 2025  
**Scope**: Full-stack TypeScript codebase (server, client, database, shared)

---

## 🟢 Strengths

### Architecture & Design
- **Clear separation of concerns**: Client (Vite + React), Server (Express + tRPC), Database (Drizzle ORM), Shared (types/constants)
- **Type-safe end-to-end**: TypeScript throughout; tRPC enforces type safety between client and server
- **Middleware pattern**: Well-implemented tRPC procedures (`publicProcedure`, `protectedProcedure`, `adminProcedure`)
- **Lazy database initialization**: `getDb()` allows local tooling to run without DATABASE_URL set
- **Gemini prompt engineering**: Thoughtful identity preservation strategy with style/angle/lighting prompts

### Code Quality
- **Consistent formatting**: Prettier enforced (2-space, double quotes, trailing commas)
- **Path aliases**: `@/*` and `@shared/*` prevent relative import hell
- **Error handling**: Structured error types with HTTP status codes
- **React patterns**: Proper hooks usage, query state management via React Query
- **Async background tasks**: Non-blocking image generation pipeline

### Security
- **Secure cookies**: `httpOnly`, `sameSite=none`, protocol-aware `secure` flag
- **JWT expiry**: One-year TTL with session token validation
- **OAuth flow**: Proper state parameter encoding for redirect URI
- **Admin role enforcement**: Middleware checks in `adminProcedure`

---

## 🟡 Issues & Concerns

### Critical Issues

#### 1. **Race Condition in Credit Deduction** (`server/routers.ts:115-116`)
**Problem**: Credits deducted in mutation, but image generation is async. If generation fails after deduction, credits are not refunded.

```typescript
// Deduct credits first (blocking)
await deductCredits(ctx.user.id, input.imageCount, generationId);

// Then start async background job (non-blocking)
(async () => {
  try {
    // ... image generation
  } catch (error) {
    // Credits already spent, no refund
    await updateGeneration(generationId, { status: "failed" });
  }
})();
```

**Recommendation**:
- Add a `creditRefund` function that runs if Gemini or S3 upload fails
- OR mark generation as "credits_reserved" until completion
- OR move credit deduction inside the async block (accept user over-spending temporarily)

---

#### 2. **Unvalidated Style/Angle/Lighting Inputs** (`server/routers.ts:75-79`)
**Problem**: Client sends `style`, `cameraAngle`, `lighting` as arbitrary strings. If user sends invalid values, Gemini may ignore them silently.

```typescript
create: protectedProcedure.input(
  z.object({
    style: z.string().optional(),        // ❌ Any string accepted
    cameraAngle: z.string().optional(),  // ❌ Any string accepted
    lighting: z.string().optional(),     // ❌ Any string accepted
  })
)
```

**Recommendation**:
```typescript
z.object({
  style: z.enum(["Editorial", "Commercial", "Artistic", "Casual", "Glamour", "Vintage"]).optional(),
  cameraAngle: z.enum(["Eye Level", "High Angle", "Low Angle", "Dutch Angle", "Over Shoulder", "Three Quarter", "Profile", "Close Up"]).optional(),
  lighting: z.enum(["Natural Light", "Studio Light", "Dramatic Light", "Soft Light", "Backlight", "Golden Hour"]).optional(),
})
```

---

#### 3. **Base64 URLs as "originalUrl"** (`client/GeneratePage.tsx:59-68`)
**Problem**: Client reads file as data URL (base64) and passes it to backend as `originalUrl`. Backend then tries to `fetch()` this base64 string.

```typescript
// Client
reader.readAsDataURL(imageFile);
createMutation.mutate({
  originalUrl: base64,  // ❌ This is "data:image/png;base64,..." not a URL
  // ...
});

// Server
const imageResponse = await fetch(input.originalUrl);  // ❌ Tries to fetch base64 as URL
```

**Recommendation**:
- Upload image to S3 first, return presigned URL
- OR accept base64 directly in input and skip the `fetch()` step
- Current workaround: The `fetch()` will fail, but Gemini still gets the base64 passed in `referenceImageBase64` if `imageResponse.ok` is false—this is buggy

---

#### 4. **Missing S3 Credential Checks** (`server/storage.ts:7-15`)
**Problem**: If `BUILT_IN_FORGE_API_KEY` or `BUILT_IN_FORGE_API_URL` are missing, error is thrown at runtime, not startup.

```typescript
function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error("Storage proxy credentials missing...");
  }
  // This error fires the first time storagePut() is called
}
```

**Recommendation**:
- Validate environment variables at server startup (not on first S3 upload)
- Add a health check in `systemRouter` to verify credentials

---

### High-Priority Issues

#### 5. **No Authorization Check on Generation Access** (`server/routers.ts:82`)
**Problem**: `generations.get` only checks that generation exists, not that it belongs to the requesting user.

```typescript
get: protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const generation = await getGeneration(input.id);
    if (!generation) return null;
    // ❌ Should check: generation.userId === ctx.user.id
    return { ...generation, imageUrls: JSON.parse(generation.imageUrls) };
  })
```

**Recommendation**:
```typescript
get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
  const generation = await getGeneration(input.id);
  if (!generation || generation.userId !== ctx.user.id) return null;
  return { ...generation, imageUrls: JSON.parse(generation.imageUrls) };
})
```

---

#### 6. **toggleFavorite Missing User Authorization** (`server/routers.ts:192-202`)
**Problem**: Same as above—no check that the generation belongs to the current user.

```typescript
toggleFavorite: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {  // ❌ ctx.user not used
    const generation = await getGeneration(input.id);
    // ❌ Missing: generation.userId !== ctx.user.id check
    await updateGeneration(input.id, { isFavorite: generation.isFavorite ? 0 : 1 });
  })
```

**Fix**: Add `ctx` parameter and verify ownership.

---

#### 7. **No Image URL Validation** (`server/routers.ts:136-147`)
**Problem**: Server uploads any string to S3, including placeholder error URLs. If Gemini fails, placehold.co URLs are persisted to database.

```typescript
} catch (error) {
  console.error("Gemini generation error:", error);
  for (let i = 0; i < input.imageCount; i++) {
    imageUrls.push(
      `https://placehold.co/600x800/0A133B/F5F7FA?text=Generation+Error`
    );
  }
}
```

**Recommendation**:
- Mark generation as `failed` instead of storing placeholder URLs
- Client should display a "retry" button if status is failed
- Only store valid image URLs from Gemini + S3

---

#### 8. **Gemini API Key Validation Only on First Call** (`server/_core/geminiImageGen.ts:94-98`)
**Problem**: Missing API key is only caught when `generateImagesWithGemini()` is called, not at startup.

```typescript
export async function generateImagesWithGemini(...) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set...");
  }
  // This error only surfaces when user tries to generate
}
```

**Recommendation**:
- Add startup validation in `server/_core/index.ts`
- Log a clear error if any required env var is missing before starting server

---

### Medium-Priority Issues

#### 9. **Unhandled Promise in Background Job** (`server/routers.ts:120`)
**Problem**: IIFE async function is not awaited, errors could be silently swallowed.

```typescript
(async () => {
  try {
    // ... image generation
  } catch (error) {
    console.error("Generation error:", error);  // Only logged, not surfaced
  }
})();  // ❌ Not awaited; errors disappear

return { id: generationId, status: "processing" };
```

**Recommendation**:
- Store job in a queue (Bull, bullmq, or background task service)
- OR track job state in database (jobId, retry count, error log)
- Current approach is fragile for production (process crash = lost jobs)

---

#### 10. **JSON Parsing Without Error Handling** (`server/routers.ts:69-71`)
**Problem**: `JSON.parse()` on `imageUrls` can throw if data is corrupted.

```typescript
list: protectedProcedure.query(async ({ ctx }) => {
  const generations = await getUserGenerations(ctx.user.id);
  return generations.map(gen => ({
    ...gen,
    imageUrls: JSON.parse(gen.imageUrls),  // ❌ Can throw SyntaxError
  }));
})
```

**Recommendation**:
```typescript
imageUrls: (() => {
  try {
    return JSON.parse(gen.imageUrls);
  } catch {
    return [];
  }
})()
```

Or better: Store as proper JSON column type in MySQL (if supported).

---

#### 11. **Client: Missing Error Boundary for Image Upload** (`client/GeneratePage.tsx:38-45`)
**Problem**: FileReader error is not caught.

```typescript
const reader = new FileReader();
reader.onloadend = () => {
  setImagePreview(reader.result as string);  // ❌ No error check
};
reader.readAsDataURL(imageFile);
```

**Recommendation**:
```typescript
const reader = new FileReader();
reader.onerror = () => toast.error("Failed to read image");
reader.onloadend = () => {
  if (reader.result) setImagePreview(reader.result as string);
};
reader.readAsDataURL(imageFile);
```

---

#### 12. **GeneratePage: Hardcoded Dummy Options** (`client/GeneratePage.tsx:21-32`)
**Problem**: Camera angles and lighting options don't match backend prompts.

```typescript
// Client hardcodes:
{["Hero low angle", "Beauty close-up", "Editorial side", "Full body"]}

// Backend expects:
{["Eye Level", "High Angle", "Low Angle", "Dutch Angle", "Over Shoulder", "Three Quarter", "Profile", "Close Up"]}
```

**Recommendation**:
- Move style/angle/lighting options to `@shared/const.ts`
- Export from backend and use on both client and server
- Fetch from `plans` endpoint or new `system.options` endpoint at startup

---

#### 13. **No Request Timeout Configuration** (`server/_core/geminiImageGen.ts:106-112`)
**Problem**: Gemini API fetch has no timeout. If API hangs, request never completes.

```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    // ❌ No timeout
  }
);
```

**Recommendation**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60_000); // 60s timeout

try {
  const response = await fetch(url, { 
    // ...
    signal: controller.signal 
  });
} finally {
  clearTimeout(timeoutId);
}
```

---

### Low-Priority Issues

#### 14. **Console.logs in Production** 
**Problem**: Many `console.log()` and `console.error()` calls without environment-based filtering.

```typescript
// server/_core/geminiImageGen.ts:103
console.log("Gemini Prompt:", enhancedPrompt);  // Logs full prompt every time

// server/db.ts:28
console.warn("[Database] Cannot upsert user: database not available");
```

**Recommendation**:
- Use structured logging (e.g., `winston`, `pino`)
- Only log errors in production; debug logs behind `process.env.NODE_ENV === "development"`

---

#### 15. **Magic Numbers Without Constants** 
**Problem**: Image dimensions, retry counts, and timeouts are hardcoded.

```typescript
// client/GeneratePage.tsx:163
<div className="w-20 h-20 rounded-xl">  // Why 20?

// server/routers.ts:72
.max(8),  // Why max 8 images?

// server/db.ts:130
.limit(50)  // Why 50 generations?
```

**Recommendation**:
```typescript
// shared/const.ts
export const MAX_IMAGES_PER_GENERATION = 8;
export const DEFAULT_GENERATION_HISTORY_LIMIT = 50;
export const THUMBNAIL_SIZE = 80;  // in pixels
```

---

#### 16. **Missing Input Sanitization**
**Problem**: `prompt` field is user-provided text with no length limit or content filter.

```typescript
prompt: z.string(),  // ❌ No .max() or filter
```

**Recommendation**:
```typescript
prompt: z.string().max(500, "Prompt too long").min(1, "Prompt required")
```

---

#### 17. **No Rate Limiting**
**Problem**: Any authenticated user can spam image generation requests.

**Recommendation**:
- Add rate limiting middleware: `express-rate-limit`
- Limit to 10 requests per minute per user
- Use Redis or in-memory store for tracking

---

#### 18. **Cookie Domain Not Set** (`server/_core/cookies.ts:32-39`)
**Problem**: Domain calculation is commented out. Cookies may not work across subdomains.

```typescript
// const shouldSetDomain = ...  // Commented out
// const domain = ...            // Commented out

return {
  httpOnly: true,
  path: "/",
  sameSite: "none",
  secure: isSecureRequest(req),
  // domain is undefined
};
```

**Recommendation**:
- Uncomment domain logic once deployment environment is known
- Or explicitly set domain in production (e.g., `.example.com`)

---

#### 19. **History Page: No Pagination**
**Problem**: All generations (up to 50) loaded at once. UI could be slow with many items.

```typescript
// server/db.ts:130
.limit(50)  // All loaded in one query
```

**Recommendation**:
- Implement cursor-based pagination
- Add `offset` and `limit` parameters to `generations.list`
- Client fetches 10 per page, user can load more

---

#### 20. **Type Safety: InsertGeneration Used for Updates**
**Problem**: `InsertGeneration` type used for both inserts and partial updates, making it unclear which fields are required.

```typescript
export async function updateGeneration(
  id: string,
  updates: Partial<InsertGeneration>  // ❌ Partial<Insert> is confusing
)
```

**Recommendation**:
```typescript
type UpdateGeneration = Partial<Omit<Generation, 'id' | 'userId' | 'createdAt'>>;

export async function updateGeneration(
  id: string,
  updates: UpdateGeneration
)
```

---

## 📋 Summary Table

| Issue | Severity | Category | Status |
|-------|----------|----------|--------|
| Race condition in credit deduction | 🔴 Critical | Logic | Not Fixed |
| Unvalidated style/angle/lighting enums | 🔴 Critical | Input Validation | Not Fixed |
| Base64 URLs as "originalUrl" | 🔴 Critical | Data Flow | Not Fixed |
| Missing S3 startup validation | 🔴 Critical | Configuration | Not Fixed |
| Generation access not authorized | 🟠 High | Security | Not Fixed |
| toggleFavorite not authorized | 🟠 High | Security | Not Fixed |
| Placeholder URLs persisted on failure | 🟠 High | Data Integrity | Not Fixed |
| Gemini API key validation deferred | 🟠 High | Configuration | Not Fixed |
| Unhandled background job promise | 🟠 High | Reliability | Not Fixed |
| JSON parse without error handling | 🟠 High | Robustness | Not Fixed |
| Client FileReader error not caught | 🟠 High | UX | Not Fixed |
| Client/server option mismatch | 🟠 High | UX | Not Fixed |
| No Gemini fetch timeout | 🟠 High | Reliability | Not Fixed |
| Console logs in production | 🟡 Low | DevOps | Not Fixed |
| Magic numbers | 🟡 Low | Code Quality | Not Fixed |
| Missing prompt sanitization | 🟡 Low | Security | Not Fixed |
| No rate limiting | 🟡 Low | Security | Not Fixed |
| Cookie domain logic commented | 🟡 Low | Configuration | Not Fixed |
| No pagination on history | 🟡 Low | Performance | Not Fixed |
| Confusing Update type | 🟡 Low | Type Safety | Not Fixed |

---

## 🎯 Recommended Priority

### Phase 1: Critical Security & Logic (Do First)
1. Add user authorization checks to generation queries/mutations
2. Fix base64 URL handling (upload to S3 first)
3. Add enum validation for style/angle/lighting
4. Implement credit refund on generation failure

### Phase 2: Reliability & Error Handling (Do Next)
5. Validate env vars at startup (Gemini, S3, JWT_SECRET)
6. Add error handling to JSON parsing
7. Add fetch timeout to Gemini API
8. Implement background job queue or retry logic

### Phase 3: Quality & Maintenance (Do Soon)
9. Consolidate client/server options (move to shared)
10. Extract magic numbers to constants
11. Add input sanitization (max lengths, content filters)
12. Set up structured logging
13. Add rate limiting middleware

---

## ✅ Recommendations for Next Steps

1. **Create a GitHub issue** for each critical issue and assign owners
2. **Add integration tests** for generation flow (credit deduction → success/failure)
3. **Add E2E tests** for authorization (verify users can't access others' generations)
4. **Set up CI** to run `pnpm check && pnpm test` on every PR
5. **Add Sentry or similar** for production error tracking
6. **Review Gemini API docs** for rate limits and retry strategy

