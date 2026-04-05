import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "AllKit terms of service. Usage terms for our free and paid developer tools.",
  alternates: { canonical: "https://allkit.dev/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-zinc dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: April 5, 2026</p>

      <h2>1. Acceptance</h2>
      <p>
        By using AllKit (allkit.dev), you agree to these terms. If you do not agree, do not use the service.
      </p>

      <h2>2. Service Description</h2>
      <p>
        AllKit provides free and paid online tools for developers, designers, and creators.
        Tools include data formatters, converters, generators, and AI-powered utilities.
      </p>

      <h2>3. Free and Paid Tiers</h2>
      <p>
        Free tier: All tools are available with usage limits on AI features (3 requests/day) and API access (3 requests/day).
        Pro and Business tiers: Paid subscriptions unlock unlimited AI usage, higher API limits, and premium features.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the service for illegal purposes</li>
        <li>Attempt to circumvent rate limits or access controls</li>
        <li>Reverse-engineer, scrape, or redistribute the service</li>
        <li>Submit content that violates intellectual property rights</li>
        <li>Use the API to build a competing service</li>
      </ul>

      <h2>5. Data Processing</h2>
      <p>
        Client-side tools process data entirely in your browser. AI-powered tools send data to third-party
        AI services for processing. See our <a href="/privacy-policy">Privacy Policy</a> for details.
        We do not claim ownership of any data you process through AllKit.
      </p>

      <h2>6. Payments and Refunds</h2>
      <p>
        Paid subscriptions are billed through Stripe. You may cancel at any time.
        We offer a 7-day refund policy for new subscriptions. After 7 days, refunds are at our discretion.
      </p>

      <h2>7. Availability</h2>
      <p>
        We aim for high availability but do not guarantee 100% uptime.
        AI-powered tools depend on third-party services (Hugging Face, Anthropic) and may experience downtime.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        AllKit is provided &quot;as is&quot; without warranties. We are not liable for any damages arising from
        the use of our tools, including but not limited to data loss, inaccurate results, or service interruptions.
        AI-generated content (privacy policies, regex patterns, etc.) should be reviewed by a professional before use.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these terms. Continued use after changes constitutes acceptance.
        Material changes will be communicated via the website.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms: support@allkit.dev
      </p>
    </div>
  );
}
