import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";

export const { auth: middlewareAuth } = NextAuth(authConfig);

export default middlewareAuth;
