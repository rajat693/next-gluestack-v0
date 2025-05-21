// app/api/save-query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { kv } from "@vercel/kv";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const MAX_QUERY_HISTORY = 10; // Set the maximum number of queries to store

export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { query, code } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const userEmail = session.user.email;
    const userKey = `user:${userEmail}`;
    const queriesKey = `queries:${userEmail}`;

    // Get the user to update request count
    const user = await kv.get(userKey);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a new query object
    const newQuery = {
      id: Date.now().toString(), // Simple ID based on timestamp
      query,
      code: code || "",
      createdAt: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    };

    // Get existing queries or create empty array
    const existingQueries: any = (await kv.get(queriesKey)) || [];

    // Add new query to the beginning of the array (most recent first)
    // This order is important because:
    // 1. It makes pagination and fetching recent queries efficient
    // 2. The frontend will reverse the order for display
    const updatedQueries = [newQuery, ...existingQueries];

    // Limit the array to MAX_QUERY_HISTORY items (10 queries)
    const limitedQueries = updatedQueries.slice(0, MAX_QUERY_HISTORY);

    // Save the updated queries
    await kv.set(queriesKey, limitedQueries);

    // Update user's queries count left
    await kv.set(userKey, {
      ...user,
      queriesCountLeft: (user as any).queriesCountLeft - 1,
    });

    return NextResponse.json({
      success: true,
      queryId: newQuery.id,
      totalQueries: limitedQueries.length,
    });
  } catch (error) {
    console.error("Error saving query:", error);
    return NextResponse.json(
      { error: "Failed to save query" },
      { status: 500 }
    );
  }
}
