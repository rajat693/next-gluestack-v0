import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { kv } from "@vercel/kv";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/", // Redirect to home page for sign in
  },
  callbacks: {
    async signIn({ user }) {
      try {
        // Create a key using the user's email
        const key = `user:${user.email}`;

        // Check if user already exists
        const existingUser = await kv.get(key);

        if (!existingUser) {
          // New user - save their data
          await kv.set(key, {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            createdAt: new Date().toISOString(),
            requestCount: 0,
            isPaid: false,
          });
          console.log("New user saved to KV:", user.email);
        } else {
          // Existing user - update last login
          await kv.set(key, {
            ...existingUser,
            lastLogin: new Date().toISOString(),
          });
          console.log("Existing user login updated:", user.email);
        }
      } catch (error) {
        console.error("KV Error:", error);
        // Still allow sign in even if KV fails
      }
      return true;
    },

    async session({ session }) {
      return session;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
