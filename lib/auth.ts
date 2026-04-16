import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { db } from "@/lib/prisma";

export const NEXT_AUTH = {
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password", placeholder: "password..." },
      },
      //@ts-ignore
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            return null;
          }

          // Demo-safe hardcoded auth: accept any email/password combo.
          // This avoids DB/OAuth/env dependency failures during presentations.
          const username = credentials.email.split('@')[0] || "demo";
          return {
            id: "demo-user-id",
            username,
            email: credentials.email,
          };
        } catch (error) {
          console.error('Error during authorization:', error);
          return null;
        }
      },
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      async profile(profile) {
        const email = profile.email || "";
        const username = profile.login;
        const imageUrl = profile.avatar_url;

        let user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email,
              username,
              password: "",
              imageUrl,
            },
          });
        }

        return { id: String(user.id), username: user.username, email: user.email };
      },
    }),
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        }
      },
      async profile(profile) {
        const email = profile.email;
        if (!email) {
          throw new Error('Google did not return an email. Ensure the Google OAuth app has the email scope and the account has a visible email.');
        }
        const username = (profile.name || '').replace(/\s+/g, '').toLowerCase() || email.split('@')[0];
        const imageUrl = profile.picture || '';

        let user = await db.user.findUnique({ where: { email } });
        if (!user) {
          user = await db.user.create({
            data: {
              email,
              username,
              password: "",
              imageUrl,
            },
          });
        }
        return { id: String(user.id), username: user.username, email: user.email };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/', // Custom sign-in page
  },
  callbacks: {
    async signIn({ user }:any) {
      // Demo mode: allow all users.
      return true;
    },
    //@ts-ignore
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
      }
      return token;
    },
    //@ts-ignore
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.userId;
        session.user.username = token.username;
      }
      return session;
    },
  },
};
