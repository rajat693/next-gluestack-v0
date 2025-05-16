// app/api/get-queries/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { kv } from "@vercel/kv";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const queriesKey = `queries:${userEmail}`;

    // Get user's queries
    const queries = (await kv.get(queriesKey)) || [];

    return NextResponse.json({
      success: true,
      queries,
    });
  } catch (error) {
    console.error("Error fetching queries:", error);
    return NextResponse.json(
      { error: "Failed to fetch queries" },
      { status: 500 }
    );
  }
}
