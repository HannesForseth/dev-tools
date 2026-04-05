"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "For casual use",
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceId: null,
    features: [
      "All developer tools (unlimited)",
      "10 AI requests per day",
      "Standard resolution media output",
      "No signup required",
    ],
    notIncluded: [
      "HD media output",
      "API access",
      "Batch processing",
      "Priority processing",
    ],
    cta: "Get Started",
    ctaLink: "/",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For daily users",
    monthlyPrice: 9,
    yearlyPrice: 79,
    monthlyPriceId: "price_1TImJ2Cjk5XbGNgtd2tXt2SH",
    yearlyPriceId: "price_1TImJ3Cjk5XbGNgt6bsdFrjn",
    features: [
      "All developer tools (unlimited)",
      "Unlimited AI requests",
      "Full HD media output",
      "No watermarks",
      "API access (1,000 req/mo)",
      "Priority support",
    ],
    notIncluded: [
      "Batch processing",
      "Higher API limits",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Business",
    description: "For teams & power users",
    monthlyPrice: 19,
    yearlyPrice: 149,
    monthlyPriceId: "price_1TImJ4Cjk5XbGNgt28LfHoW5",
    yearlyPriceId: "price_1TImJ5Cjk5XbGNgtPYhehJn1",
    features: [
      "Everything in Pro",
      "Batch processing",
      "API access (10,000 req/mo)",
      "Priority queue",
      "Commercial license",
      "Dedicated support",
    ],
    notIncluded: [],
    cta: "Go Business",
    highlighted: false,
  },
];

export function PricingCards() {
  const [annual, setAnnual] = useState(true);

  const handleCheckout = async (priceId: string) => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Checkout error:", e);
    }
  };

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            annual ? "bg-primary" : "bg-border"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual <span className="text-primary text-xs font-medium">Save ~25%</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
          const period = annual ? "/year" : "/mo";
          const priceId = annual
            ? (plan as { yearlyPriceId?: string }).yearlyPriceId
            : (plan as { monthlyPriceId?: string }).monthlyPriceId;

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border p-6 ${
                plan.highlighted
                  ? "border-primary shadow-lg shadow-primary/10 bg-card"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${price === 0 ? "0" : price}</span>
                {price > 0 && <span className="text-muted-foreground">{period}</span>}
              </div>

              <button
                onClick={() => priceId ? handleCheckout(priceId) : undefined}
                className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : plan.name === "Free"
                    ? "border border-border hover:bg-muted"
                    : "border border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {plan.cta}
              </button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
