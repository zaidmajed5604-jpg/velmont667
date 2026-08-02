"use client";

import { useEffect } from "react";
import Button from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-luxury flex min-h-[70vh] flex-col items-center justify-center pt-20 text-center">
      <span className="eyebrow">Something Went Wrong</span>
      <h1 className="mt-5 font-display text-display-md font-normal text-ink">
        We&rsquo;ve hit a snag
      </h1>
      <p className="mt-4 max-w-md font-sans text-[15px] text-ink-muted">
        Please try again, or reach out to our concierge team if the problem continues.
      </p>
      <Button onClick={reset} className="mt-8">
        Try Again
      </Button>
    </div>
  );
}
