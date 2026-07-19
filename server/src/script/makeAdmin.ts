import { auth } from "../config/firebase"; // 👈 Changed: Named import matching your file
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔴 PASTE YOUR ACTUAL FIREBASE UID HERE
const TARGET_UID = "YOUR_EXACT_FIREBASE_UID_HERE";

async function promoteToAdmin() {
  try {
    console.log(`Starting admin promotion for UID: ${TARGET_UID}...`);

    // 1. Set the Custom Claim using your modular auth instance!
    await auth.setCustomUserClaims(TARGET_UID, { role: "admin" });
    console.log("✅ Firebase Auth: Custom claims set successfully.");

    // 2. Update your local PostgreSQL Database row via Prisma
    const updatedUser = await prisma.user.update({
      where: { firebaseUid: TARGET_UID },
      data: { role: "admin" },
    });

    console.log(
      `✅ PostgreSQL Database: Role successfully updated to 'admin' for ${updatedUser.email}.`,
    );
    console.log(
      "\n🎉 Promotion complete! Log out and back in on your frontend to apply changes.",
    );
  } catch (error) {
    console.error("❌ Critical Failure promoting user:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

promoteToAdmin();
