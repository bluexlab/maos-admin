import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { count, eq, sql } from "drizzle-orm";
import { getServerSession, type DefaultSession, type NextAuthOptions } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { db } from "~/drizzle";
import { accounts, invitingUsers, sessions, users, verificationTokens } from "~/drizzle/schema";
import { env } from "~/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      // id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session }) => {
      return {
        ...session,
        user: {
          ...session.user,
        },
      };
    },
    async signIn({ user }) {
      // count users in database
      const [rec] = await db.select({ userCount: count() }).from(users);
      const userCount = rec?.userCount ?? 0;

      if (userCount === 0) {
        // there is no users, that means admin ui is in bootstraping. add the first user as admin
        return true;
      }

      if (user.name && user.email) {
        // check if the user is a valid user
        const [existingUser] = await db.select().from(users).where(eq(users.email, user.email));
        if (existingUser) {
          return true;
        }

        // Check if the user is in the invitingUsers table.
        // If found, remove the user from invitingUsers and allow sign-in.
        // If not found, deny sign-in for non-invited users.
        const [result] = await db.execute(sql`
          WITH invited_user AS (
            DELETE FROM ${invitingUsers}
            WHERE email = ${user.email}
            RETURNING *
          )
          SELECT EXISTS (SELECT 1 FROM invited_user) AS was_invited
        `);

        if (result?.was_invited) {
          return true;
        }
      }
      return false;
    },
  },

  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,

  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
