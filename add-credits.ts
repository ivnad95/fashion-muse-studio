import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function addCredits() {
  const userId = "BJQA2m349v5k8rHGkNeH9r";
  
  // Get current credits
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  console.log("Current credits:", user[0]?.credits || 0);
  
  // Add 100 credits
  await db.update(users).set({ credits: (user[0]?.credits || 0) + 100 }).where(eq(users.id, userId));
  
  // Verify
  const updated = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  console.log("New credits:", updated[0]?.credits);
}

addCredits().then(() => process.exit(0)).catch(console.error);
