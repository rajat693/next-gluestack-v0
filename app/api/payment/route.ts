import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
        const queriesToAdd = 2;

        // Get the session cookie
        const cookies = request.headers.get("cookie") || "";

        // Call the update-query-count endpoint
        const response = await fetch(
          `${request.headers.get("origin")}/api/update-query-count`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: cookies, // Forward the session cookie
            },
            body: JSON.stringify({
              queriesToAdd,
            }),
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          console.error(
            "Failed to update query count after payment:",
            responseData.error
          );
          return NextResponse.json(
            {
              success: false,
              error: "Payment successful but failed to update query count",
              paymentIntent: paymentIntent.id,
            },
            { status: 500 }
          );
        }

        // Return success with both payment and query update information
        return NextResponse.json({
          success: true,
          client_secret: paymentIntent.client_secret,
          queriesAdded: queriesToAdd,
          paidQueryResetDate: responseData.paidQueryResetDate,
        });
      } catch (updateError) {
        console.error("Error updating user query count:", updateError);
        return NextResponse.json(
          {
            success: false,
            error: "Payment successful but failed to update query count",
            paymentIntent: paymentIntent.id,
          },
          { status: 500 }
        );
      }
    }

    // Return success response for payment intent creation
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
