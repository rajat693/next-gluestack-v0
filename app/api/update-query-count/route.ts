import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { kv } from "@vercel/kv";

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to update query count",
        },
        { status: 401 }
      );
    }

    const { queriesToAdd } = await request.json();

    // Validate input
    if (typeof queriesToAdd !== "number" || queriesToAdd <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid number of queries to add" },
        { status: 400 }
      );
    }

    // Get user data
    const userKey = `user:${session.user.email}`;
    const userData: any = await kv.get(userKey);

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate paidQueryResetDate (30 days from now)
    const paidQueryResetDate = new Date();
    paidQueryResetDate.setDate(paidQueryResetDate.getDate() + 30);

    // Update user data
    const updatedUserData = {
      ...userData,
      queriesCountLeft: queriesToAdd,
      isPaid: true,
      lastPaymentDate: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
      paidQueryResetDate: paidQueryResetDate.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    };

    // Save updated user data
    await kv.set(userKey, updatedUserData);

    return NextResponse.json({
      success: true,
      newQueryCount: queriesToAdd,
      paidQueryResetDate: paidQueryResetDate.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      }),
    });
  } catch (err) {
    console.error("Error updating query count:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update query count" },
      { status: 500 }
    );
  }
}
