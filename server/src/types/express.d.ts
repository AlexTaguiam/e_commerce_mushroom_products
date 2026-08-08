import { DecodedIdToken } from "firebase-admin/auth";
import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken & {
        role: string;
      };
      dbUser?: User; // 👈 Allows access to req.dbUser in all route controllers
    }
  }
}
