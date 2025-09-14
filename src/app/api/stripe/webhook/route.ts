import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { match, P } from "ts-pattern";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  console.log("🔵 Webhook received:", {
    hasBody: !!body,
    hasSignature: !!signature,
    hasEndpointSecret: !!endpointSecret,
  });

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    );

    console.log("✅ Webhook event constructed:", {
      type: event.type,
      id: event.id,
      created: event.created,
    });

    await match(event.type)
      .with("checkout.session.completed", async () => {
        console.log("🎯 Processing checkout.session.completed");
        const session = event.data.object as Stripe.Checkout.Session;
        return handleCheckoutCompleted(session);
      })
      .with("customer.subscription.created", async () => {
        console.log("🎯 Processing customer.subscription.created");
        const subscription = event.data.object as Stripe.Subscription;
        return handleSubscriptionCreated(subscription);
      })
      .with("customer.subscription.updated", async () => {
        console.log("🎯 Processing customer.subscription.updated");
        const subscription = event.data.object as Stripe.Subscription;
        return handleSubscriptionUpdated(subscription);
      })
      .with("customer.subscription.deleted", async () => {
        console.log("🎯 Processing customer.subscription.deleted");
        const subscription = event.data.object as Stripe.Subscription;
        return handleSubscriptionDeleted(subscription);
      })
      .with("invoice.payment_succeeded", async () => {
        console.log("🎯 Processing invoice.payment_succeeded");
        const invoice = event.data.object as Stripe.Invoice;
        return handleInvoicePaymentSucceeded(invoice);
      })
      .with("invoice.payment_failed", async () => {
        console.log("🎯 Processing invoice.payment_failed");
        const invoice = event.data.object as Stripe.Invoice;
        return handleInvoicePaymentFailed(invoice);
      })
      .with("customer.subscription.trial_will_end", async () => {
        console.log("🎯 Processing customer.subscription.trial_will_end");
        const subscription = event.data.object as Stripe.Subscription;
        return handleTrialWillEnd(subscription);
      })
      .otherwise(() => {
        console.log("⚠️ Unhandled webhook type:", event.type);
        return Promise.resolve();
      });

    console.log("✅ Webhook processed successfully");
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("🔄 handleCheckoutCompleted started:", {
    sessionId: session.id,
    mode: session.mode,
    status: session.status,
    paymentStatus: session.payment_status,
  });

  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  console.log("📋 Session metadata:", {
    userId,
    planId,
    customer: session.customer,
    subscription: session.subscription,
  });

  if (!userId || !planId) {
    console.error("❌ Missing metadata in checkout session:", {
      sessionId: session.id,
      userId,
      planId,
      allMetadata: session.metadata,
    });
    return;
  }

  return match(session.mode)
    .with("payment", async () => {
      console.log("💳 Processing one-time payment");
      try {
        const result = await prisma.subscription.upsert({
          where: { userId },
          update: {
            planId,
            status: "active",
            stripeCustomerId: session.customer as string,
            updatedAt: new Date(),
          },
          create: {
            userId,
            planId,
            status: "active",
            stripeCustomerId: session.customer as string,
          },
        });
        console.log("✅ One-time payment subscription upserted:", result.id);
        return result;
      } catch (error) {
        console.error("❌ Error upserting payment subscription:", error);
        throw error;
      }
    })
    .with("subscription", async () => {
      console.log("🔄 Processing subscription checkout");
      try {
        // First, check if user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          console.error("❌ User not found:", userId);
          return;
        }

        console.log("✅ User found:", user.id);

        const result = await prisma.subscription.upsert({
          where: { userId },
          update: {
            planId,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            updatedAt: new Date(),
          },
          create: {
            userId,
            planId,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        console.log("✅ Subscription upserted successfully:", {
          id: result.id,
          userId: result.userId,
          planId: result.planId,
          status: result.status,
          stripeCustomerId: result.stripeCustomerId,
          stripeSubscriptionId: result.stripeSubscriptionId,
        });
        return result;
      } catch (error) {
        console.error("❌ Error upserting subscription:", error);
        throw error;
      }
    })
    .otherwise(() => {
      console.log(`⚠️ Unhandled checkout session mode: ${session.mode}`);
      return Promise.resolve();
    });
}

// Add similar logging to other handler functions
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("🔄 handleSubscriptionCreated started:", {
    subscriptionId: subscription.id,
    status: subscription.status,
    customerId: subscription.customer,
  });

  const customerId = subscription.customer as string;
  const planId = subscription.metadata?.planId;

  if (!planId) {
    console.error(
      "❌ Missing planId in subscription metadata:",
      subscription.id
    );
    return;
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  console.log("📋 Existing subscription check:", {
    customerId,
    existingSubscription: existingSubscription?.id || "none",
  });

  return match(existingSubscription)
    .with(null, async () => {
      console.log("🆕 Creating new subscription record");
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        console.log("⚠️ Customer is deleted:", customerId);
        return;
      }

      const userId = customer.metadata?.userId;
      if (!userId) {
        console.error("❌ No userId in customer metadata:", customerId);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.error("❌ User not found in database:", userId);
        return;
      }

      console.log("✅ User found for subscription creation:", user.id);

      try {
        const result = await prisma.subscription.upsert({
          where: { userId },
          update: {
            planId,
            status: subscription.status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: customerId,
            updatedAt: new Date(),
          },
          create: {
            userId,
            planId,
            status: subscription.status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: customerId,
          },
        });
        console.log("✅ New subscription created:", result.id);
        return result;
      } catch (error) {
        console.error("❌ Error creating subscription:", error);
        throw error;
      }
    })
    .otherwise(async (existing) => {
      console.log("🔄 Updating existing subscription:", existing.id);
      try {
        const result = await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            planId,
            status: subscription.status,
            stripeSubscriptionId: subscription.id,
            updatedAt: new Date(),
          },
        });
        console.log("✅ Existing subscription updated:", result.id);
        return result;
      } catch (error) {
        console.error("❌ Error updating subscription:", error);
        throw error;
      }
    });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("🔄 handleSubscriptionUpdated:", subscription.id);
  try {
    const result = await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        updatedAt: new Date(),
      },
    });
    console.log("✅ Subscription updated:", { count: result.count });
    return result;
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("🔄 handleSubscriptionDeleted:", subscription.id);
  try {
    const result = await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: "canceled",
        updatedAt: new Date(),
      },
    });
    console.log("✅ Subscription deleted/canceled:", { count: result.count });
    return result;
  } catch (error) {
    console.error("❌ Error deleting subscription:", error);
    throw error;
  }
}

async function getSubscriptionIdFromInvoice(
  invoice: Stripe.Invoice
): Promise<string | null> {
  const subscriptionLineItem = invoice.lines.data.find(
    (line) => line.subscription
  );

  return match(subscriptionLineItem?.subscription)
    .with(P.string, (id) => id)
    .with(P.instanceOf(Object), (sub: Stripe.Subscription) => sub.id)
    .with(null, () => null)
    .with(undefined, () => null)
    .otherwise(() => null);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("🔄 handleInvoicePaymentSucceeded:", invoice.id);
  const subscriptionId = await getSubscriptionIdFromInvoice(invoice);

  return match(subscriptionId)
    .with(P.string, async (id) => {
      try {
        const result = await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: id },
          data: {
            status: "active",
            updatedAt: new Date(),
          },
        });
        console.log("✅ Invoice payment succeeded - subscription updated:", {
          count: result.count,
        });
        return result;
      } catch (error) {
        console.error(
          "❌ Error updating subscription on payment success:",
          error
        );
        throw error;
      }
    })
    .with(null, () => {
      console.log("⚠️ No subscription ID found in invoice");
      return Promise.resolve();
    })
    .otherwise(() => Promise.resolve());
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log("🔄 handleInvoicePaymentFailed:", invoice.id);
  const subscriptionId = await getSubscriptionIdFromInvoice(invoice);

  return match(subscriptionId)
    .with(P.string, async (id) => {
      try {
        const result = await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: id },
          data: {
            status: "past_due",
            updatedAt: new Date(),
          },
        });
        console.log("✅ Invoice payment failed - subscription updated:", {
          count: result.count,
        });
        return result;
      } catch (error) {
        console.error(
          "❌ Error updating subscription on payment failure:",
          error
        );
        throw error;
      }
    })
    .with(null, () => {
      console.log("⚠️ No subscription ID found in failed invoice");
      return Promise.resolve();
    })
    .otherwise(() => Promise.resolve());
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log("🔄 Trial will end for subscription:", subscription.id);
}
