import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      createdAt?: Date;
      displayName: string | null;
      email: string;
      id: string;
      updatedAt?: Date;
    };
  }

  interface User {
    createdAt?: Date;
    displayName: string | null;
    email: string;
    id: string;
    updatedAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    createdAt?: string;
    displayName?: string | null;
    email?: string;
    id?: string;
    updatedAt?: string;
  }
}
