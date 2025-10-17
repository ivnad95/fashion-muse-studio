import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  credits: int("credits").default(10).notNull(), // Free credits on signup
  subscriptionPlan: mysqlEnum("subscriptionPlan", [
    "free",
    "basic",
    "pro",
    "unlimited",
  ])
    .default("free")
    .notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", [
    "active",
    "cancelled",
    "expired",
  ])
    .default("active")
    .notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Generations table - stores AI image generation history
 */
export const generations = mysqlTable("generations", {
  id: varchar("id", { length: 64 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 64 }).notNull(),
  originalUrl: text("originalUrl").notNull(),
  imageCount: int("imageCount").notNull(),
  aspectRatio: varchar("aspectRatio", { length: 32 })
    .default("portrait")
    .notNull(),
  prompt: text("prompt").notNull(),
  style: varchar("style", { length: 128 }),
  cameraAngle: varchar("cameraAngle", { length: 128 }),
  lighting: varchar("lighting", { length: 128 }),
  imageUrls: text("imageUrls").notNull(), // JSON array of URLs
  status: mysqlEnum("status", [
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled",
  ])
    .default("pending")
    .notNull(),
  errorMessage: text("errorMessage"),
  processingTime: int("processingTime"),
  modelUsed: varchar("modelUsed", { length: 128 })
    .default("gemini-2.5-flash")
    .notNull(),
  isFavorite: int("isFavorite").default(0).notNull(), // 0 or 1 for boolean
  isPublic: int("isPublic").default(0).notNull(),
  views: int("views").default(0).notNull(),
  downloads: int("downloads").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

/**
 * Subscription plans configuration
 */
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  displayName: varchar("displayName", { length: 128 }).notNull(),
  description: text("description"),
  monthlyCredits: int("monthlyCredits").notNull(),
  priceMonthly: int("priceMonthly").notNull(), // in cents
  priceYearly: int("priceYearly").notNull(), // in cents
  features: text("features").notNull(), // JSON array of features
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * Credit transactions - track credit usage and purchases
 */
export const creditTransactions = mysqlTable("creditTransactions", {
  id: varchar("id", { length: 64 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("userId", { length: 64 }).notNull(),
  amount: int("amount").notNull(), // positive for credit, negative for debit
  type: mysqlEnum("type", [
    "purchase",
    "subscription",
    "generation",
    "refund",
    "bonus",
  ]).notNull(),
  description: text("description"),
  generationId: varchar("generationId", { length: 64 }),
  balanceAfter: int("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;
