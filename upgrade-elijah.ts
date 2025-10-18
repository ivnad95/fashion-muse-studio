import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function upgradeElijah() {
  const email = "elijah.uk20@gmail.com";
  
  // Find user by email
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (user.length === 0) {
    console.log("❌ User not found with email:", email);
    return;
  }
  
  console.log("Found user:", user[0].name, "-", user[0].email);
  console.log("Current role:", user[0].role);
  console.log("Current credits:", user[0].credits);
  
  // Upgrade to super_admin with unlimited credits (999999)
  await db.update(users)
    .set({ 
      role: "super_admin",
      credits: 999999,
      subscriptionPlan: "unlimited",
      subscriptionStatus: "active"
    })
    .where(eq(users.id, user[0].id));
  
  // Verify
  const updated = await db.select().from(users).where(eq(users.id, user[0].id)).limit(1);
  console.log("\n✅ User upgraded successfully!");
  console.log("New role:", updated[0].role);
  console.log("New credits:", updated[0].credits);
  console.log("Subscription plan:", updated[0].subscriptionPlan);
}

upgradeElijah().then(() => process.exit(0)).catch(console.error);
