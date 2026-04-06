import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Stripe webhook handler
// Handles: checkout.session.completed, customer.subscription.updated/deleted

/**
 * Verify Stripe webhook signature (v1 scheme).
 * We implement this manually to avoid pulling in the full stripe SDK.
 */
function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  toleranceSeconds = 300
): { valid: boolean; error?: string } {
  try {
    const parts = sigHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        acc[key] = acc[key] || [];
        acc[key].push(value);
      }
      return acc;
    }, {});

    const timestamp = parts["t"]?.[0];
    const signatures = parts["v1"] || [];

    if (!timestamp || signatures.length === 0) {
      return { valid: false, error: "Missing timestamp or signature in header" };
    }

    // Check timestamp tolerance (protect against replay attacks)
    const ts = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - ts) > toleranceSeconds) {
      return { valid: false, error: "Webhook timestamp too old" };
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(signedPayload, "utf8")
      .digest("hex");

    // Compare against all v1 signatures
    const match = signatures.some(
      (sig) => crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))
    );

    return match ? { valid: true } : { valid: false, error: "Signature mismatch" };
  } catch (e) {
    return { valid: false, error: `Signature verification failed: ${e}` };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // Verify webhook signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const verification = verifyStripeSignature(body, sig, webhookSecret);
  if (!verification.valid) {
    console.error("Webhook signature verification failed:", verification.error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          customer: string;
          subscription: string;
          customer_email: string;
          customer_details?: { email?: string };
        };

        const email =
          session.customer_email ||
          session.customer_details?.email ||
          "";

        console.log("Checkout completed:", {
          customerId: session.customer,
          subscriptionId: session.subscription,
          email,
        });

        // Generate a unique API key for the new Pro user
        const apiKey = `ak_${crypto.randomBytes(24).toString("hex")}`;

        // Upsert user: create if new, update if existing (matched by stripe_customer_id or email)
        const { error } = await supabase
          .from("users")
          .upsert(
            {
              email,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              subscription_status: "active",
              api_key: apiKey,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stripe_customer_id" }
          );

        if (error) {
          // If conflict on stripe_customer_id fails (new customer), try insert
          if (error.code === "23505") {
            // Unique violation — try updating by email instead
            const { error: updateError } = await supabase
              .from("users")
              .update({
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                subscription_status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("email", email);

            if (updateError) {
              console.error("Failed to update user by email:", updateError);
            }
          } else {
            console.error("Failed to upsert user:", error);
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as {
          id: string;
          status: string;
          customer: string;
          items: { data: { price: { id: string } }[] };
        };

        console.log("Subscription updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer,
        });

        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: subscription.status,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer);

        if (error) {
          console.error("Failed to update subscription status:", error);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as {
          id: string;
          customer: string;
        };

        console.log("Subscription canceled:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer);

        if (error) {
          console.error("Failed to set subscription to canceled:", error);
        }

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
