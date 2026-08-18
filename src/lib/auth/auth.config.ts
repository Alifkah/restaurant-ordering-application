import type { NextAuthConfig } from "next-auth";
import { UserRole, UserStatus } from "@/db/schema/enums";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [], // Filled in src/lib/auth/index.ts for Node.js runtime
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as UserRole) || (token.role as UserRole) || "customer";
        token.status = (user.status as UserStatus) || (token.status as UserStatus) || "active";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) || "customer";
        session.user.status = (token.status as UserStatus) || "active";
      }
      return session;
    },
  },
};
