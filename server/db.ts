import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { creditTransactions, generations, InsertCreditTransaction, InsertGeneration, InsertSubscriptionPlan, InsertUser, subscriptionPlans, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Credit system helpers
export async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const user = await getUser(userId);
  return user?.credits ?? 0;
}

export async function deductCredits(userId: string, amount: number, generationId?: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const user = await getUser(userId);
  if (!user || user.credits < amount) return false;
  
  const newBalance = user.credits - amount;
  
  await db.update(users).set({ credits: newBalance }).where(eq(users.id, userId));
  
  const transaction: InsertCreditTransaction = {
    userId,
    amount: -amount,
    type: "generation",
    description: `Generated ${amount} image(s)`,
    generationId,
    balanceAfter: newBalance,
  };
  
  await db.insert(creditTransactions).values(transaction);
  
  return true;
}

export async function addCredits(userId: string, amount: number, type: "purchase" | "subscription" | "bonus" | "refund", description?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const user = await getUser(userId);
  if (!user) return;
  
  const newBalance = user.credits + amount;
  
  await db.update(users).set({ credits: newBalance }).where(eq(users.id, userId));
  
  const transaction: InsertCreditTransaction = {
    userId,
    amount,
    type,
    description: description ?? `Added ${amount} credits`,
    balanceAfter: newBalance,
  };
  
  await db.insert(creditTransactions).values(transaction);
}

// Generation helpers
export async function createGeneration(generation: InsertGeneration) {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(generations).values(generation);
  return generation;
}

export async function updateGeneration(id: string, updates: Partial<InsertGeneration>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(generations).set(updates).where(eq(generations.id, id));
}

export async function getUserGenerations(userId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(generations).where(eq(generations.userId, userId)).orderBy(desc(generations.createdAt)).limit(limit);
}

export async function getGeneration(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(generations).where(eq(generations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function deleteGeneration(id: string, userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  // Verify ownership before deletion
  const generation = await getGeneration(id);
  if (!generation || generation.userId !== userId) {
    return false;
  }
  
  await db.delete(generations).where(eq(generations.id, id));
  return true;
}

// Subscription plan helpers
export async function getActiveSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, 1)).orderBy(subscriptionPlans.sortOrder);
}

export async function seedSubscriptionPlans() {
  const db = await getDb();
  if (!db) return;
  
  const plans: InsertSubscriptionPlan[] = [
    {
      id: "free",
      name: "free",
      displayName: "Free",
      description: "Perfect for trying out Fashion Muse",
      monthlyCredits: 10,
      priceMonthly: 0,
      priceYearly: 0,
      features: JSON.stringify(["10 credits/month", "Basic image generation", "Standard quality", "Community support"]),
      isActive: 1,
      sortOrder: 1,
    },
    {
      id: "basic",
      name: "basic",
      displayName: "Basic",
      description: "Great for casual creators",
      monthlyCredits: 100,
      priceMonthly: 999,
      priceYearly: 9990,
      features: JSON.stringify(["100 credits/month", "All image styles", "High quality output", "Priority support", "Commercial use"]),
      isActive: 1,
      sortOrder: 2,
    },
    {
      id: "pro",
      name: "pro",
      displayName: "Pro",
      description: "For professional photographers",
      monthlyCredits: 500,
      priceMonthly: 2999,
      priceYearly: 29990,
      features: JSON.stringify(["500 credits/month", "All premium features", "Ultra HD quality", "Priority processing", "Dedicated support", "API access"]),
      isActive: 1,
      sortOrder: 3,
    },
    {
      id: "unlimited",
      name: "unlimited",
      displayName: "Unlimited",
      description: "For agencies and power users",
      monthlyCredits: 999999,
      priceMonthly: 9999,
      priceYearly: 99990,
      features: JSON.stringify(["Unlimited credits", "All features included", "Maximum priority", "White-label options", "Custom integrations", "24/7 premium support"]),
      isActive: 1,
      sortOrder: 4,
    },
  ];
  
  for (const plan of plans) {
    await db.insert(subscriptionPlans).values(plan).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  }
}
