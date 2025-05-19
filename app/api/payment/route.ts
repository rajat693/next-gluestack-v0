import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil", // Use the latest API version
});

export async function POST(request: NextRequest) {
  try {
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
    });

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
