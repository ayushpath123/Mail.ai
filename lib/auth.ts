import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt'; // Import bcrypt for hashing
import { db } from "@/lib/prisma";

export const NEXT_AUTH = {
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
          if (!credentials?.email || !credentials?.password) {
            return null; // Return null if email or password is missing
          }
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const newUser = await db.user.create({
              data: {
                email: credentials.email,
                password: hashedPassword, 
                username: credentials.email.split('@')[0],
                plan: 'FREE',
                imageUrl: "",
              },
            });

            return {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
            };
          }

          // Sign-in: Compare provided password with hashed password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null; // Return null if password doesn't match
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
          };
        } catch (error) {
          console.error('Error during authorization:', error);
          return null; // Return null in case of an error
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
      async profile(profile) {
        const email = profile.email || "";
        const username = profile.name.replace(/\s+/g, '').toLowerCase();
        const imageUrl = profile.picture;

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
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/', // Custom sign-in page
  },
  callbacks: {
    async signIn({ user }:any) {
      // Prevent sign-in for specific users (e.g., random@gmail.com)
      if (user.email === "random@gmail.com") {
        return false;
      }
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
