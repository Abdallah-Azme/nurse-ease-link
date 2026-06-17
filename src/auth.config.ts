import type { NextAuthConfig } from "next-auth";

export type Role = "patient" | "nurse" | "doctor" | "admin";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as Role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const protectedPrefixes = ["/patient", "/nurse", "/doctor", "/admin"];
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

      if (pathname === "/login" && auth?.user) {
        return Response.redirect(new URL(`/${auth.user.role}`, request.nextUrl));
      }

      if (!isProtected) return true;
      if (!auth?.user) return false;

      if (pathname.startsWith("/patient") && auth.user.role !== "patient") return false;
      if (pathname.startsWith("/nurse") && auth.user.role !== "nurse") return false;
      if (pathname.startsWith("/doctor") && auth.user.role !== "doctor") return false;
      if (pathname.startsWith("/admin") && auth.user.role !== "admin") return false;

      return true;
    },
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig;
