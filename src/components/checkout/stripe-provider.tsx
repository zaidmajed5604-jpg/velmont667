"use client";

import { Elements } from "@stripe/react-stripe-js";
import type { ReactNode } from "react";
import { getStripeClient } from "@/lib/stripe/client";

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

/** Wraps the payment form in Stripe's Elements context, themed to match the VELMONT palette. */
export default function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  return (
    <Elements
      stripe={getStripeClient()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#14120F",
            colorBackground: "#FFFFFF",
            colorText: "#14120F",
            colorDanger: "#8C3B2E",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            borderRadius: "2px",
            spacingUnit: "4px",
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
