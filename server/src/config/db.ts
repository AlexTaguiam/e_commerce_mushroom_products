import { PrismaClient } from "@prisma/client";

// Log actual DB errors/warnings to the server console so connection or query
// failures are visible instead of surfacing only as opaque 500s.
const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export default prisma;
