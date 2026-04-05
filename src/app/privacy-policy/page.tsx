import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AllKit privacy policy. How we handle your data, cookies, and third-party services.",
  alternates: { canonical: "https://allkit.dev/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose prose-zinc dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: April 5, 2026</p>

      <h2>Overview</h2>
      <p>
        AllKit (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates allkit.dev. We are committed to protecting your privacy.
        This policy explains what data we collect, why, and how we handle it.
      </p>

      <h2>Data We Collect</h2>
      <h3>Client-Side Tools</h3>
      <p>
        Most AllKit tools (JSON Formatter, Base64, UUID Generator, Hash Generator, etc.) run entirely in your browser.
        <strong> No data is sent to our servers.</strong> Your input never leaves your device.
      </p>
      <h3>AI-Powered Tools</h3>
      <p>
        Tools labeled &quot;AI&quot; (Background Remover, Image to Text, AI Image Generator, Text to Speech, Regex Builder, Cron Generator, Privacy Policy Generator)
        send your input to third-party AI services (Anthropic Claude API, Hugging Face Spaces) for processing.
        We do not store your input or the results. Third-party services may have their own data retention policies.
      </p>
      <h3>API Usage</h3>
      <p>
        When you use the AllKit API (/api/v1/), we log your IP address for rate limiting purposes.
        API request data is processed in memory and not stored persistently.
      </p>

      <h2>Analytics</h2>
      <p>
        We use PostHog for product analytics. PostHog collects anonymized usage data including page views,
        clicks, and session recordings to help us improve AllKit. You can opt out by enabling
        &quot;Do Not Track&quot; in your browser.
      </p>

      <h2>Cookies</h2>
      <p>
        AllKit uses minimal cookies. PostHog sets a first-party cookie to identify unique sessions.
        We do not use advertising cookies or share data with ad networks.
      </p>

      <h2>Payments</h2>
      <p>
        Payments are processed by Stripe. We never see or store your credit card details.
        Stripe&apos;s privacy policy applies to payment processing.
      </p>

      <h2>Third-Party Services</h2>
      <ul>
        <li><strong>Vercel</strong> — hosting and CDN</li>
        <li><strong>Stripe</strong> — payment processing</li>
        <li><strong>PostHog</strong> — product analytics</li>
        <li><strong>Anthropic (Claude API)</strong> — AI text generation</li>
        <li><strong>Hugging Face Spaces</strong> — AI image/audio processing</li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        We do not store user-submitted content. Analytics data is retained per PostHog&apos;s default retention policy.
        Rate limiting data is stored in memory and cleared on server restart.
      </p>

      <h2>Your Rights (GDPR/CCPA)</h2>
      <p>
        You have the right to access, correct, or delete your personal data. Since we collect minimal data,
        there is typically nothing to delete. For any privacy requests, contact us at privacy@allkit.dev.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. Changes will be posted on this page with an updated date.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions: privacy@allkit.dev
      </p>
    </div>
  );
}
