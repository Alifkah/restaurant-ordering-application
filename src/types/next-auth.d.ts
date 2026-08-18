import { DefaultSession } from "next-auth";
import { UserRole, UserStatus } from "@/db/schema/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: UserRole;
    status?: UserStatus;
    passwordHash?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    status?: UserStatus;
  }
}
