import { NextRequest, NextResponse } from "next/server";

// Stripe webhook handler
// Handles: checkout.session.completed, customer.subscription.updated/deleted

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // TODO: Verify webhook signature with STRIPE_WEBHOOK_SECRET
    // For now, we log the event. Signature verification will be added
    // when we have the webhook secret configured.

    const event = JSON.parse(body);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout completed:", {
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_email,
        });
        // TODO: Update user's subscription status in Supabase
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("Subscription updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price?.id,
        });
        // TODO: Update subscription status in Supabase
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("Subscription canceled:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });
        // TODO: Downgrade user in Supabase
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
