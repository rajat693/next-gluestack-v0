"use client";
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import stripePromise from "@/lib/stripe";
import PaymentForm from "@/components/payment-form";

export default function Payment() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 py-4">
          <h1 className="text-2xl font-bold text-center text-white">
            Complete Your Payment
          </h1>
        </div>

        <div className="p-8">
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Total amount:{" "}
              <span className="font-medium text-gray-900 text-lg">$19.99</span>
            </p>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm amount={19.99} />
          </Elements>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Your payment is secured by Stripe</p>
            <p className="mt-1">
              You will receive a confirmation email once payment is completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
