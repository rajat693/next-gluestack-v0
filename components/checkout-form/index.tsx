"use client";
import React, { useState, FormEvent } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

interface PaymentResponse {
  success: boolean;
  error?: string;
  client_secret?: string;
}

const CheckoutForm = ({ amount }: { amount: number }) => {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const handleChange = async (event: any) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setProcessing(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setError(`Payment failed: ${error.message}`);
      setProcessing(false);
      return;
    }

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_method_id: paymentMethod.id,
          amount: Math.round(amount * 100), // convert to cents and ensure integer
        }),
      });

      // Check if the response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON if possible
          const errorJson = JSON.parse(errorText);
          setError(`Payment failed: ${errorJson.error || "Server error"}`);
        } catch (parseError: any) {
          console.log("parseError", parseError);
          setError(
            `Payment failed: Server returned ${
              response.status
            }: ${errorText.substring(0, 100)}`
          );
        }
        setProcessing(false);
        return;
      }

      const paymentResponse: PaymentResponse = await response.json();

      if (paymentResponse.success) {
        // Immediately redirect to success page
        router.push("/payment-success");
      } else {
        setError(`Payment failed: ${paymentResponse.error || "Unknown error"}`);
        setProcessing(false);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(`Payment failed: ${err.message}`);
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: "Arial, sans-serif",
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#6b7280",
        },
      },
      invalid: {
        color: "#ef4444",
        iconColor: "#ef4444",
      },
    },
  };

  return (
    <>
      {processing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Processing payment...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <div className="p-4 bg-white border border-gray-200 rounded-md">
          <CardElement options={cardStyle} onChange={handleChange} />
          <p className="text-xs text-gray-500 mt-2">
            Enter your card details including the ZIP/postal code
          </p>
        </div>

        <button
          disabled={processing || disabled}
          type="submit"
          className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {processing ? "Processing..." : "Pay Now"}
        </button>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </>
  );
};

export default CheckoutForm;
