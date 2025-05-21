import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { kv } from "@vercel/kv";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil", // Use the latest API version
});

export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to make a payment" },
        { status: 401 }
      );
    }

    const { payment_method_id, amount } = await request.json();

    // Validate inputs
    if (!payment_method_id || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: payment_method_id,
      confirm: true,
      return_url: `${request.headers.get("origin") || ""}/payment-success`,
      metadata: {
        user_email: session.user.email,
      },
    });

    // If payment was successful, update the user's query count
    if (paymentIntent.status === "succeeded") {
      try {
        // Get user data
        const userKey = `user:${session.user.email}`;
        const userData: any = await kv.get(userKey);

        if (userData) {
          // Calculate the new queries count by adding 50 to the existing count
          const currentCount = userData.queriesCountLeft || 0;
          const newQueriesCount = currentCount + 2; // Add 50 queries

          console.log("Current query count:", currentCount);
          console.log("New query count after adding 50:", newQueriesCount);

          // Update user data with increased queries and paid status
          const updatedUserData = {
            ...userData,
            queriesCountLeft: newQueriesCount, // Add 50 to the existing count
            isPaid: true,
            updatedAt: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            }),
            lastPaymentDate: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            }),
          };

          // Save updated user data
          await kv.set(userKey, updatedUserData);
        }
      } catch (updateError) {
        console.error("Error updating user query count:", updateError);
        // Still return success, we'll handle this separately on the success page
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      client_secret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Payment processing error:", err);

    // Handle Stripe errors properly
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { success: false, error: "Payment processing failed" },
      { status: 500 }
    );
  }
}
