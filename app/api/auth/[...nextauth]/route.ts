import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { kv } from "@vercel/kv";

// Types
interface UserData {
  id: string;
  email: string;
  name: string;
  image: string;
  createdAt: string;
  queriesCountLeft: number;
  isPaid: boolean;
  freeQueryResetDate: string;
  lastLogin?: string;
}

// Utility functions
const getISTDate = (date: Date = new Date()) => {
  return date.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
};

const getNextMonthDate = () => {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

const createNewUserData = (user: any): UserData => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    createdAt: getISTDate(),
    queriesCountLeft: 1,
    isPaid: false,
    freeQueryResetDate: getISTDate(getNextMonthDate()),
  };
};

const updateExistingUserData = (existingUser: UserData): UserData => {
  const currentDate = new Date();
  const resetDate = new Date(existingUser.freeQueryResetDate);

  // If reset date has passed, update the query count and reset date
  if (currentDate > resetDate) {
    return {
      ...existingUser,
      queriesCountLeft: 1,
      freeQueryResetDate: getISTDate(getNextMonthDate()),
      lastLogin: getISTDate(),
    };
  }

  // Just update last login
  return {
    ...existingUser,
    lastLogin: getISTDate(),
  };
};

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
        const key = `user:${user.email}`;
        const existingUser = await kv.get<UserData>(key);

        if (!existingUser) {
          // New user - save their data
          const newUserData = createNewUserData(user);
          await kv.set(key, newUserData);
          console.log("New user saved to KV:", user.email);
        } else {
          // Update existing user data
          const updatedUserData = updateExistingUserData(existingUser);
          await kv.set(key, updatedUserData);
          console.log("Existing user login updated:", user.email);
        }
      } catch (error) {
        console.error("KV Error:", error);
        // Still allow sign-in even if KV fails
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
