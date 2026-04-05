import type { Metadata } from "next";
import { PricingCards } from "@/components/pricing/pricing-cards";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose your plan. Free forever, or upgrade to Pro for unlimited AI tools, HD output, and API access.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          All tools are free to use. Upgrade for unlimited AI, HD output, and API access.
        </p>
      </section>

      <PricingCards />

      {/* FAQ */}
      <section className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-8">FAQ</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">What&apos;s included in the free plan?</h3>
            <p className="text-sm text-muted-foreground">All tools are available for free with some limits: 10 AI-powered requests per day, and lower resolution for media tools. Client-side tools like JSON Formatter, UUID Generator, and Base64 are completely unlimited.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">Yes. Cancel your subscription at any time from your account. You&apos;ll keep Pro access until the end of your billing period.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Is there a refund policy?</h3>
            <p className="text-sm text-muted-foreground">If you&apos;re not satisfied within the first 7 days, contact us for a full refund.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Do I need to create an account?</h3>
            <p className="text-sm text-muted-foreground">No account needed for free tools. You&apos;ll create an account when upgrading to Pro to manage your subscription.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
