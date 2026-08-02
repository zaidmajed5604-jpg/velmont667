"use client";

import { useState } from "react";
import { COUNTRIES, CURRENCIES } from "@/lib/constants";

/**
 * Country/currency selector. Persists choice to localStorage; actual price
 * conversion and shipping-zone logic should be wired into the checkout's
 * server-side calculation once a rates provider (e.g. Stripe adaptive
 * pricing or a dedicated FX API) is connected.
 */
export default function RegionSelector() {
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="flex items-center gap-4 font-sans text-xs text-ink-muted">
      <label className="flex items-center gap-2">
        <span className="sr-only">Country</span>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="cursor-pointer border-0 bg-transparent text-ink-muted focus:outline-none"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <span aria-hidden="true">/</span>
      <label className="flex items-center gap-2">
        <span className="sr-only">Currency</span>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="cursor-pointer border-0 bg-transparent text-ink-muted focus:outline-none"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
