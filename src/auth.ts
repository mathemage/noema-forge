import { createHash } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { AuthError, authenticateUser } from "@/lib/auth/service";
import {
  getAuthSecret,
  readServerEnv,
  shouldTrustAuthHost,
  usesAuthJsCredentials,
} from "@/lib/env";
import { credentialsSchema } from "@/lib/auth/validation";

export const { auth, handlers, signIn, signOut } = NextAuth(() => {
  const env = readServerEnv();
  const authJsCredentialsEnabled = usesAuthJsCredentials(env);
  const secret = authJsCredentialsEnabled
    ? getAuthSecret(env)
    : createHash("sha256")
        .update(`${env.NEXT_PUBLIC_APP_NAME}:${env.NEXT_PUBLIC_APP_URL}:journal`)
        .digest("hex");

  const parseTokenDate = (value: unknown) => {
    if (typeof value !== "string") {
      return new Date(0);
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
  };

  return {
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.createdAt =
            user.createdAt instanceof Date
              ? user.createdAt.toISOString()
              : undefined;
          token.displayName = user.displayName ?? null;
          token.email = user.email;
          token.id = user.id;
          token.updatedAt =
            user.updatedAt instanceof Date
              ? user.updatedAt.toISOString()
              : undefined;
        }

        return token;
      },
      async session({ session, token }) {
        session.user = {
          ...session.user,
          createdAt: parseTokenDate(token.createdAt),
          displayName:
            typeof token.displayName === "string" ? token.displayName : null,
          email: typeof token.email === "string" ? token.email : "",
          id: typeof token.id === "string" ? token.id : "",
          name:
            typeof token.displayName === "string" ? token.displayName : null,
          updatedAt: parseTokenDate(token.updatedAt),
        };

        return session;
      },
    },
    pages: {
      signIn: "/sign-in",
    },
    providers: authJsCredentialsEnabled
      ? [
          Credentials({
            credentials: {
              email: {
                label: "Email",
                type: "email",
              },
              password: {
                label: "Password",
                type: "password",
              },
            },
            async authorize(credentials) {
              const result = credentialsSchema.safeParse(credentials);

              if (!result.success) {
                return null;
              }

              try {
                return await authenticateUser(result.data);
              } catch (error) {
                if (error instanceof AuthError) {
                  return null;
                }

                throw error;
              }
            },
            name: "Journal credentials",
          }),
        ]
      : [],
    secret,
    session: {
      strategy: "jwt",
    },
    trustHost: shouldTrustAuthHost(env),
  } satisfies NextAuthConfig;
});
