import { db } from "../db/index";
import { achievements } from "../db/schema";
import { eq } from "drizzle-orm";

async function debug() {
  console.log("--- Database State ---");
  const all = await db.select().from(achievements);
  console.log(`Total Achievements in DB: ${all.length}`);
  all.forEach((a) =>
    console.log(
      `[${a.id}] ${a.title} (Visible: ${a.isVisible}, Type: ${typeof a.isVisible})`,
    ),
  );

  console.log("\n--- Checking Filter Logic ---");
  // Simulate what the controller does
  const visible = await db
    .select()
    .from(achievements)
    .where(eq(achievements.isVisible, true));
  console.log(`Visible Achievements (via Filter): ${visible.length}`);

  // Check if any "false" are actually visible
  const hidden = await db
    .select()
    .from(achievements)
    .where(eq(achievements.isVisible, false));
  console.log(`Hidden Achievements (via Filter): ${hidden.length}`);
}

debug()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
