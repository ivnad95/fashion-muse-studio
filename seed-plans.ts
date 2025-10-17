import { seedSubscriptionPlans } from "./server/db";

async function main() {
  console.log("Seeding subscription plans...");
  await seedSubscriptionPlans();
  console.log("Subscription plans seeded successfully!");
  process.exit(0);
}

main().catch(error => {
  console.error("Error seeding plans:", error);
  process.exit(1);
});
