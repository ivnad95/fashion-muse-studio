import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";

/**
 * Validate that all required environment variables are set
 */
function validateEnvironment() {
  const requiredEnvVars = [
    { key: "JWT_SECRET", name: "JWT signing secret" },
    { key: "DATABASE_URL", name: "MySQL database connection" },
    { key: "VITE_APP_ID", name: "OAuth app ID" },
    { key: "OAUTH_SERVER_URL", name: "OAuth server URL" },
    { key: "GEMINI_API_KEY", name: "Gemini API key" },
    { key: "BUILT_IN_FORGE_API_URL", name: "Storage API URL" },
    { key: "BUILT_IN_FORGE_API_KEY", name: "Storage API key" },
  ];

  const missingVars: string[] = [];

  for (const { key, name } of requiredEnvVars) {
    if (!process.env[key]) {
      missingVars.push(`${key} (${name})`);
    }
  }

  if (missingVars.length > 0) {
    console.error(
      "\n❌ Missing required environment variables:\n  - " +
        missingVars.join("\n  - ")
    );
    console.error(
      "\nPlease set these variables in your .env file or environment.\n"
    );
    process.exit(1);
  }

  console.log("✅ All required environment variables are configured");
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Validate environment variables first
  validateEnvironment();

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
