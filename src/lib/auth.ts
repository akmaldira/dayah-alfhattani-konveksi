import { PrismaAdapter } from "@auth/prisma-adapter";
import { createId } from "@paralleldrive/cuid2";
import NextAuth, { DefaultSession } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { comparePassword } from "./bcrypt";
import { prisma } from "./prisma";
import { User as DatabaseUser, UserRole } from "./prisma/generated";

declare module "next-auth" {
  interface User extends DatabaseUser {
    role: UserRole;
    password?: never;
  }
  interface Session {
    user: DatabaseUser & DefaultSession["user"] & { password: never };
  }
}

const adapter = PrismaAdapter(prisma);
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      // @ts-ignore
      authorize: async (credentials) => {
        let user = null;

        user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          throw new Error("Email atau password anda salah");
        }

        const isValid = comparePassword(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          throw new Error("Email atau password anda salah");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = createId();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
});
