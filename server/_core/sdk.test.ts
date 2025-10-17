import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const setupRequiredEnv = () => {
  process.env.VITE_APP_ID = "test-app";
  process.env.OAUTH_SERVER_URL = "https://example.com";
};

describe("SDKServer session handling", () => {
  beforeEach(() => {
    vi.resetModules();
    for (const key of Object.keys(process.env)) {
      if (!(key in ORIGINAL_ENV)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, ORIGINAL_ENV);
    setupRequiredEnv();
  });

  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in ORIGINAL_ENV)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it("allows sessions where the name claim is an empty string", async () => {
    process.env.JWT_SECRET = "test-secret";
    const { sdk } = await import("./sdk");

    const token = await sdk.createSessionToken("user-123");
    const session = await sdk.verifySession(token);

    expect(session).not.toBeNull();
    expect(session?.name).toBe("");
  });

  it("throws a descriptive error when JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;
    const { sdk } = await import("./sdk");

    await expect(
      sdk.createSessionToken("user-456")
    ).rejects.toThrowError(/JWT_SECRET/);
  });
});
